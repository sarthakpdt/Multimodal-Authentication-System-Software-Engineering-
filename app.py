import os
import datetime
import cv2
from flask import Flask,jsonify,request,render_template,redirect,url_for,session
import face_recognition
import mysql.connector


app=Flask(__name__)
 
registered_data={}


@app.route("/")
def index():
    return render_template("design_1.html")


@app.route("/register",methods=["POST"])
def register():
    name=request.form.get("name")
    photo=request.files['photo']
    uploads_folder=os.path.join(os.getcwd(),"static","uploads")
    if not os.path.exists(uploads_folder):
        os.makedirs(uploads_folder)
    
    photo.save(os.path.join(uploads_folder,f'{datetime.date.today()}_{name}.jpg'))

    registered_data[name]=f"{datetime.date.today()}_{name}.jpg"

    response={"success":True,'name':name}
    return jsonify(response)

@app.route("/login", methods=["POST"])
def login():
    name=request.form.get("name")
    photo = request.files['photo']

    uploads_folder = os.path.join(os.getcwd(), "static", "uploads")

    if not os.path.exists(uploads_folder):
        os.makedirs(uploads_folder)

    login_filename = os.path.join(uploads_folder, "login_face.jpg")
    photo.save(login_filename)

    login_image = cv2.imread(login_filename)
    if login_image is None:
        return jsonify({"success": False, "message": "Invalid image file."})

    gray_image = cv2.cvtColor(login_image, cv2.COLOR_BGR2GRAY)

    face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + "haarcascade_frontalface_default.xml")
    faces=face_cascade.detectMultiScale(gray_image,scaleFactor=1.1,minNeighbors=5, minSize=(30,30))
    if len(faces)==0:
        response={"success":False,"message":"No face detected in the image."}
        return jsonify(response)
    
    login_image=face_recognition.load_image_file(login_filename)
    login_face_encodings = face_recognition.face_encodings(login_image)

    if len(login_face_encodings) == 0:
        response = {"success": False}
        return jsonify(response)

    for registered_name, filename in registered_data.items():
        if name!=registered_name:
            continue
        registered_photo = os.path.join(uploads_folder, filename)
        registered_image = face_recognition.load_image_file(registered_photo)
        registered_face_encodings = face_recognition.face_encodings(registered_image)

        if len(registered_face_encodings) > 0 and len(login_face_encodings) > 0:
            matches = face_recognition.compare_faces(registered_face_encodings, login_face_encodings[0])
            print("matches",matches)
            
            if any(matches):
                response = {"success": True, "name": registered_name}
                return jsonify(response)

    response = {"success": False, "message": "Face or name does not match."}
    return jsonify(response)

# Add these new routes to app.py
@app.route("/register-face")
def register_face():
    return render_template("register.html", mode="register")

@app.route("/login-face")
def login_face():
    return render_template("login.html", mode="login")

@app.route("/design_1.html")
def design_1():
    return render_template("design_1.html")

@app.route("/success")
def success():
    user_name=request.args.get("user_name")
    return redirect("https://www.amazon.com")

if __name__=="__main__":
    app.run(debug=True)