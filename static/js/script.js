let video;
let canvas;
let nameInput;

function init() {
    video = document.getElementById("video");
    canvas = document.getElementById("canvas");
    nameInput = document.getElementById("name");

    navigator.mediaDevices.getUserMedia({video:true})
        .then(stream=>{
            video.srcObject = stream;
            video.play();
        })
        .catch(error => {
            console.error("Error accessing webcam:", error);
            alert("Cannot access webcam. Please check your camera permissions.");
        });
}

function capture() {
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.style.display = "block";
    video.style.display = "none";
}

function goBack() {
    window.location.href = "/design_1.html";
}

function register() {
    const name = nameInput.value
    const photo = dataURItoBlob(canvas.toDataURL());

    if (!name) {
        alert("Please enter your name.");
        return;
    }
    
    if (!photo) {
        alert("Please capture a photo.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("photo", photo, `${name}.jpg`);

    fetch("/register", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert("Registration successful!");
            window.location.href = "/";
        } else {
            alert("Failed to register. Try again.");
        }
    })
    .catch(error => {
        console.error("Registration error:", error);
        alert("Error during registration. Please try again.");
    });
}

function login() {
    const context = canvas.getContext("2d");
    const photo = dataURItoBlob(canvas.toDataURL());
    const name = nameInput.value;

    if (!photo) {
        alert("Please capture a photo to proceed.");
        return;
    }
    if (!name) {
        alert("Please enter your name.");
        return;
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("photo", photo, 'login_face.jpg');

    fetch("/login", {
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log(data);
        if (data.success) {
            alert("Login successful!");
            window.location.href = "/success?user_name=" + nameInput.value;
        } else {
            alert("Login failed. Try again.");
        }
    })
    .catch(error => {
        console.log("Login error:", error);
        alert("Error during login. Please try again.");
    });
}

// Utility function: Converts DataURI to Blob
function dataURItoBlob(dataURI) {
    const byteString = atob(dataURI.split(',')[1]);
    const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
}

// Initialize webcam access
init()

