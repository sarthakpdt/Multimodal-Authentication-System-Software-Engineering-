const express = require("express");
const mysql = require("mysql2");
const cors = require("cors");
const nodemailer = require("nodemailer");
const bodyParser = require('body-parser');
const crypto = require("crypto");
const path = require("path");
const jwt = require("jsonwebtoken");
require('dotenv').config();

const app = express();
const corsOptions = {
    origin: "*", // Allow all origins for development (restrict in production)
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  };
app.use(cors(corsOptions));
app.use(express.static(path.join(__dirname, "../public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/favicon.ico', (req, res) => res.status(204).end());

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "1234567890",
    database: "hostelmanagment",
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
    } else {
        console.log("Connected to MySQL Database");
    }
});


// Ensure Users Table Exists
db.query(`
  CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    reset_token VARCHAR(255),
    token_expiry DATETIME,
    otp VARCHAR(10),
    otp_expiry DATETIME
  );
`, (err) => {
    if (err) console.error("Error ensuring users table exists:", err);
});

// Nodemailer Setup
const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
        user: "sarthakpandit2005@gmail.com",
        pass: "uljm mchv chvm thjg" // Make sure to use an app password if 2FA is enabled
    },
});

// Register User with unique username check and password validation
app.post("/register", async (req, res) => {
    const { username, email, password } = req.body;

    // Check if username already exists
    db.query("SELECT * FROM users WHERE username = ?", [username], (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ message: "Error checking username" });
        }

        if (results.length > 0) {
            return res.status(400).json({ message: "Username already registered, please use another username" });
        }

        // Password validation regex
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;

        if (!passwordRegex.test(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters." });
        }

        const sql = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
        db.query(sql, [username, email, password], (err, result) => {
            if (err) {
                console.error("Registration Error:", err);
                return res.status(500).json({ message: "Error registering user" });
            }
            res.status(201).json({ message: "Registration successful" });
        });
    });
});

// Login User without bcrypt
app.post("/login", (req, res) => {
    const { email, password, otp } = req.body;

    // First, check if the OTP is valid
    if (otpStore[email] !== otp) {
        return res.status(400).json({ message: "Invalid or expired OTP." });
    }

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error("Login Error:", err);
            return res.status(500).json({ message: "Error during login" });
        }

        if (result.length > 0) {
            // Compare passwords directly
            if (password === result[0].password) {
                // Clear OTP after successful login
                delete otpStore[email];
                res.json({ message: "Login successful", data: result });
            } else {
                res.status(401).json({ message: "Invalid email or password" });
            }
        } else {
            res.status(401).json({ message: "Invalid email or password" });
        }
    });
});

// Forgot Password - Generate Reset Link with JWT
app.post("/forgot-password", (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: "Email is required" });

    db.query("SELECT * FROM users WHERE email = ?", [email], (err, results) => {
        if (err) return res.status(500).json({ message: "Database error" });

        if (results.length === 0) {
            return res.status(404).json({ message: "Email not found" });
        }

        const user = results[0];
        // Create JWT token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET || 'your-secret-key',
            { expiresIn: '1h' }
        );

        const expiry = new Date(Date.now() + 3600000); // 1 hour

        db.query(
            "UPDATE users SET reset_token = ?, token_expiry = ? WHERE email = ?",
            [token, expiry, email],
            (updateErr) => {
                if (updateErr) return res.status(500).json({ message: "Error generating reset token" });

                const resetLink = `http://192.168.137.1:5000/reset-password?token=${token}`;

                const mailOptions = {
                    from: "sarthakpandit2005@gmail.com",
                    to: email,
                    subject: "Password Reset",
                    html: `
                        <div style="font-family: Arial, sans-serif; max-width: 600px;">
                            <h2>Password Reset Request</h2>
                            <p>Click below to reset your password:</p>
                            <a href="${resetLink}" style="padding:10px 20px; background:#007bff; color:#fff; text-decoration:none; border-radius:5px;">
                                Reset Password
                            </a>
                            <p>Or copy and paste this link: <a href="${resetLink}">${resetLink}</a></p>
                            <p>This link expires in 1 hour.</p>
                        </div>
                    `,
                };

                transporter.sendMail(mailOptions, (mailErr, info) => {
                    if (mailErr) return res.status(500).json({ message: "Error sending reset email" });

                    res.json({ message: "Password reset link sent to your email" });
                });
            }
        );
    });
});

app.post("/reset-password", (req, res) => {
    console.log("Request received at /reset-password");
    console.log("Request body:", req.body);

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
        console.error("Missing token or newPassword in request body");
        return res.status(400).json({ message: "Token and password are required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "your-secret-key");
        console.log("Token verified. Decoded payload:", decoded);

        db.query(
            "SELECT * FROM users WHERE id = ? AND reset_token = ? AND token_expiry > NOW()",
            [decoded.userId, token],
            (err, results) => {
                if (err) {
                    console.error("Database query error:", err);
                    return res.status(500).json({ message: "Database error occurred." });
                }

                if (results.length === 0) {
                    console.error("Invalid or expired token:", token);
                    return res.status(400).json({ message: "Invalid or expired token." });
                }

                const user = results[0];
                console.log("User found:", user);

                db.query(
                    "UPDATE users SET password = ?, reset_token = NULL, token_expiry = NULL WHERE id = ?",
                    [newPassword, user.id],
                    (updateErr) => {
                        if (updateErr) {
                            console.error("MySQL UPDATE error:", updateErr);
                            return res.status(500).json({ message: "Error updating password." });
                        }

                        console.log("Password reset successfully for user ID:", user.id);
                        res.json({ message: "Password updated successfully." });
                    }
                );
            }
        );
    } catch (error) {
        console.error("Token verification error:", error);
        if (error.name === "TokenExpiredError") {
            return res.status(400).json({ message: "Token has expired." });
        }
        if (error.name === "JsonWebTokenError") {
            return res.status(400).json({ message: "Invalid token." });
        }
        res.status(500).json({ message: "An error occurred while resetting password." });
    }
});

// Fetch All Users
app.get("/users", (req, res) => {
    db.query("SELECT * FROM users", (err, results) => {
        if (err) return res.status(500).json({ message: "Error fetching users" });
        res.json(results);
    });
});

// Edit User
app.put("/edit", (req, res) => {
    const { id, username, email } = req.body;
    if (!id || !username || !email) return res.status(400).json({ message: "All fields are required!" });

    db.query("UPDATE users SET username=?, email=? WHERE id=?", [username, email, id], (err) => {
        if (err) return res.status(500).json({ message: "Error updating user" });
        res.json({ message: "User updated successfully" });
    });
});

// Delete User
app.delete("/delete", (req, res) => {
    const { id } = req.body;
    if (!id) return res.status(400).json({ message: "User ID is required!" });

    db.query("DELETE FROM users WHERE id=?", [id], (err) => {
        if (err) return res.status(500).json({ message: "Error deleting user" });
        res.json({ message: "User deleted successfully" });
    });
});

app.get('/reset-password', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

const otpStore = {}; // In-memory store for OTPs (temporary)

app.post("/send-otp", (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = otp;  // store OTP temporarily in memory

    const mailOptions = {
        from: 'sarthakpandit2005@gmail.com',
        to: email,
        subject: 'Your OTP Code',
        text: `Your One-Time Password (OTP) is: ${otp}`
    };

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            console.error("Error sending OTP:", err);
            return res.status(500).json({ error: "Failed to send OTP. Try again." });
        }
        res.json({ message: "OTP sent to your email." });
    });
});

// Start Server
app.listen(5000, () => {
    console.log("Server is running on port 5000");
});