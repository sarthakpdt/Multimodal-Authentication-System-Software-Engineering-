const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MySQL connection setup
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234567890,         // Your MySQL root password
    database: 'abc'    // Make sure this DB and table exist
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err);
        return;
    }
    console.log("MySQL Connected!");
});

// Store OTPs temporarily in-memory
let otpStore = {};

// Nodemailer setup
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'sbagaria180@gmail.com',       // <-- Replace with your Gmail
        pass: 'fejh uaid ucdh bojn'           // <-- Replace with your Gmail App Password
    }
});

// Sign up route
app.post("/signup", (req, res) => {
    const { username, email, password } = req.body;

    const query = "INSERT INTO users (username, email, password) VALUES (?, ?, ?)";
    db.query(query, [username, email, password], (err, result) => {
        if (err) {
            console.error("Signup error:", err);
            return res.status(500).json({ error: "User may already exist or DB error." });
        }
        res.json({ message: "Account created successfully." });
    });
});

// Send OTP route
app.post("/send-otp", (req, res) => {
    const { email } = req.body;
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    otpStore[email] = otp;  // store in memory

    const mailOptions = {
        from: 'sbagaria180@gmail.com',
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

// Login route with OTP verification
app.post("/login", (req, res) => {
    const { email, password, otp } = req.body;

    // Check OTP first
    if (otpStore[email] !== otp) {
        return res.status(400).json({ error: "Invalid or expired OTP." });
    }

    const query = "SELECT * FROM users WHERE email = ? AND password = ?";
    db.query(query, [email, password], (err, results) => {
        if (err || results.length === 0) {
            return res.status(401).json({ error: "Invalid email or password." });
        }

        // Clear OTP after successful login
        delete otpStore[email];
        res.json({ message: "Login successful!" });
    });
});

// Start the server
app.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});
