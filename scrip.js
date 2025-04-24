document.addEventListener("DOMContentLoaded", function () {
  const container = document.getElementById("container");
  const loginBtn = document.getElementById("login");
  const registerBtn = document.getElementById("register");
  const forgotPasswordLink = document.getElementById("forgot-password");
  const resetFormContainer = document.getElementById("reset-form-container");
  const closeReset = document.getElementById("close-reset");
  const resetForm = document.getElementById("reset-form");
  const resetEmailInput = document.getElementById("reset-email");
  const resetSubmit = document.getElementById("reset-submit");
  const sendOtpBtn = document.getElementById("sendOtpBtn");
  const otpInput = document.getElementById("otp");

  // Toggle to Sign In
  loginBtn.addEventListener("click", function () {
    container.classList.remove("active");
  });

  // Toggle to Sign Up
  registerBtn.addEventListener("click", function () {
    container.classList.add("active");
  });

  // Show Reset Password Form (modal-style form, optional UI)
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (event) {
      event.preventDefault();
      const email = prompt("Enter your email to reset password:");
      if (!email) return;

      fetch("http://localhost:5000/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
        .then((res) => res.json())
        .then((data) => alert(data.message))
        .catch((err) => {
          console.error("Error:", err);
          alert("An error occurred. Please try again.");
        });
    });
  }

  // Close Reset Form (only needed if using custom popup form, optional)
  if (closeReset) {
    closeReset.addEventListener("click", function () {
      resetFormContainer.style.display = "none";
    });
  }

  // Reset Password Page (new-password form)
  const resetFormPage = document.getElementById("reset-form");
  if (resetFormPage) {
    resetFormPage.addEventListener("submit", async (event) => {
      event.preventDefault();
      const newPassword = document.getElementById("new-password").value.trim();
      const confirmPassword = document.getElementById("confirm-password").value.trim();
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      if (!newPassword || !confirmPassword) {
        alert("Please fill out both fields.");
        return;
      }

      if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }

      try {
        const response = await fetch("http://localhost:5000/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token, newPassword }),
        });
        const result = await response.json();
        alert(result.message);
        if (response.ok) {
          window.location.href = "index.html";
        }
      } catch (err) {
        console.error("Error resetting password:", err);
        alert("Error resetting password. Try again.");
      }
    });
  }

  // Registration
document.querySelector(".sign-up form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const username = document.querySelector(".sign-up input[name='username']").value.trim();
  const email = document.querySelector(".sign-up input[name='email']").value.trim();
  const password = document.querySelector(".sign-up input[name='password']").value.trim();

  if (!username || !email || !password) {
      alert("Username, email, and password are required!");
      return;
  }

  // Password validation regex
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  if (!passwordRegex.test(password)) {
      alert("Password must be at least 8 characters long and include uppercase letters, lowercase letters, numbers, and special characters.");
      return;
  }

  try {
      const response = await fetch("http://localhost:5000/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, email, password }),
      });

      const result = await response.json();
      alert(result.message);

      // If registration is successful, switch to login panel
      if (response.ok) {
          document.getElementById("container").classList.remove("active");
      }
  } catch (err) {
      console.error("Registration error:", err);
      alert("An error occurred. Please try again.");
  }
});

  // Login
  document.querySelector(".sign-in form").addEventListener("submit", async (event) => {
    event.preventDefault();
    const email = document.querySelector(".sign-in input[placeholder='Email']").value.trim();
    const password = document.querySelector(".sign-in input[placeholder='Password']").value.trim();

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();

      if (response.ok) {
        if (email === "abc@gmail.com") {
          // Admin-specific logic
          displayAdminDashboard(result.data);
        } else {
          alert("Login successful");
          window.location.href = "dashboard.html";
        }
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error("Login error:", err);
      alert("An error occurred. Please try again.");
    }
  });
});

// Admin Dashboard
function displayAdminDashboard(data) {
  document.body.innerHTML = `
    <div class="admin-container">
      <h1 class="admin-heading">Welcome Admin</h1>
      <input type="text" id="searchBar" placeholder="Search by Username or Email" oninput="searchUser()">
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Username</th>
              <th>Email</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody id="userTable"></tbody>
        </table>
      </div>
    </div>
  `;
  applyAdminStyles();
  populateTable(data);
}

// Admin Panel Styles
function applyAdminStyles() {
  const style = document.createElement("style");
  style.innerHTML = `
    body {
      font-family: 'Poppins', sans-serif;
      background-color: #f4f4f4;
      text-align: center;
      padding: 20px;
    }
    .admin-container {
      max-width: 80%;
      margin: 0 auto;
      background: white;
      padding: 20px;
      border-radius: 10px;
      box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
    }
    .admin-heading {
      font-size: 32px;
      color: #333;
      margin-bottom: 20px;
    }
    #searchBar {
      width: 50%;
      padding: 10px;
      font-size: 16px;
      border: 1px solid #ccc;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    th, td {
      padding: 12px;
      text-align: center;
      border-bottom: 1px solid #ddd;
    }
    th {
      background-color: black;
      color: white;
    }
    tr:hover {
      background-color: #f1f1f1;
    }
    .edit-btn, .delete-btn {
      background-color: black;
      color: white;
      padding: 8px 15px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      margin: 5px;
    }
    .edit-btn:hover, .delete-btn:hover {
      background-color: #444;
    }
  `;
  document.head.appendChild(style);
}

// Populate Admin User Table
function populateTable(data) {
  const tableBody = document.getElementById("userTable");
  tableBody.innerHTML = data.map(user => `
    <tr>
      <td>${user.id}</td>
      <td><input type="text" value="${user.username}" id="user_${user.id}" /></td>
      <td><input type="text" value="${user.email}" id="email_${user.id}" /></td>
      <td>
        <button class="edit-btn" onclick="editUser(${user.id})">Edit</button>
        <button class="delete-btn" onclick="deleteUser(${user.id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

// Edit User
async function editUser(userId) {
  const username = document.getElementById(`user_${userId}`).value;
  const email = document.getElementById(`email_${userId}`).value;
  if (!username || !email) {
    alert("Both username and email are required.");
    return;
  }
  try {
    const response = await fetch("http://localhost:5000/edit", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId, username, email }),
    });
    const result = await response.json();
    alert(result.message);
  } catch (err) {
    console.error("Error updating user:", err);
    alert("Error updating user.");
  }
}

// Delete User
async function deleteUser(userId) {
  const confirmDelete = confirm("Are you sure you want to delete this user?");
  if (!confirmDelete) return;
  try {
    const response = await fetch("http://localhost:5000/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: userId }),
    });
    const result = await response.json();
    alert(result.message);
    searchUser();
  } catch (err) {
    console.error("Error deleting user:", err);
    alert("Error deleting user.");
  }
}

// Search Users
async function searchUser() {
  const query = document.getElementById("searchBar").value.trim().toLowerCase();
  try {
    const response = await fetch("http://localhost:5000/users");
    const users = await response.json();
    const filteredUsers = users.filter(user =>
      user.username.toLowerCase().includes(query) || user.email.toLowerCase().includes(query)
    );
    populateTable(filteredUsers);
  } catch (err) {
    console.error("Error searching users:", err);
    alert("Error searching users.");
  }
}