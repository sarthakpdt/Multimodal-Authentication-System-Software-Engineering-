// Save as public/script.js
document.addEventListener("DOMContentLoaded", function () {
    const container = document.getElementById("container");
    const registerBtn = document.getElementById("register");
    const loginBtn = document.getElementById("login");
    const sendOtpBtn = document.getElementById("sendOtpBtn");
    const otpInput = document.getElementById("otp");

    let otpSent = false;

    registerBtn.addEventListener("click", () => {
        container.classList.add("active");
    });

    loginBtn.addEventListener("click", () => {
        container.classList.remove("active");
    });

    sendOtpBtn.addEventListener("click", async () => {
        const email = document.getElementById("login-email").value.trim();

        if (!email) {
            alert("Enter email to receive OTP.");
            return;
        }

        const response = await fetch("http://localhost:3000/send-otp", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email })
        });

        const result = await response.json();
        if (response.ok) {
            alert("OTP sent to your email.");
            otpInput.classList.remove("hidden");
        } else {
            alert(result.error);
        }
    });

    document.getElementById("signup-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const username = document.getElementById("username").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        const res = await fetch("http://localhost:3000/signup", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ username, email, password })
        });

        const result = await res.json();
        alert(result.message || result.error);
    });

    document.getElementById("login-form").addEventListener("submit", async (event) => {
        event.preventDefault();
        const email = document.getElementById("login-email").value.trim();
        const password = document.getElementById("login-password").value.trim();
        const otp = otpInput.value.trim();

        const res = await fetch("http://localhost:3000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password, otp })
        });

        const result = await res.json();
        if (res.ok) {
            alert("Login successful!");
        } else {
            alert(result.error);
        }
    });
});
