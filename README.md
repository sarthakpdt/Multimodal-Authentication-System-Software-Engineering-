# MultiModal Authentication System Software Engneering 

Protect the data of the user by various Multimodal Authentication System such as Fingerprint, Facecam, username and password 

## Features
1. Three-layer Authentication – Username/Password + Facial Recognition + Voice Matching
2. Machine Learning Models – Used for both face and voice matching
3. Modular Architecture – Easy to expand or replace individual modules
4. Security-first Design – Minimizes spoofing & identity theft risks
5. System-level & Unit-level Complexity Analysis – Follows Software Engineering practices

## Requirements

Use Python ≥ 3.8. Conda recommended: [Anaconda](https://docs.anaconda.com/anaconda/install/linux/)

Install the following:
1. pandas
2. numpy
3. scikit-learn
4. imbalanced-learn
5. seaborn
6. matplotlib
7. networkx
8. opencv-python
9. speechrecognition
10. pyaudio


## To setup the environment:
1. Create virtual environment
   conda create -n multimodal-auth python=3.8
2. Activate environment
   conda activate multimodal-auth
3. Install all required packages
   pip install -r requirements.txt

## Project Structure 
```plaintext
/Multimodal-Auth/
│
├── /data/                  # Place user face and voice samples here
├── /face_module/          # Face recognition scripts (OpenCV + ML model)
├── /voice_module/         # Voice recognition scripts (SpeechRecognition + classifier)
├── /text_module/          # Username/password handling
├── /utils/                # Shared utilities and config
├── main.py                # Entry point for the system
├── requirements.txt
└── README.md
```

## Running the code
python main.py

It will guide the user through:
1. Text-based login
2. Real-time face recognition (via webcam)
3. Voice matching (via microphone input)

Only if all 3 match, access is granted.

## Software Engineering Analysis (included in project)
1. SRS Document 
2. UML DIagram
3. Verisioning
4. Comparision with existing Tech
5. Essence Cards
   

