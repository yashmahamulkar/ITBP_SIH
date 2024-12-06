from flask import Flask,abort, send_from_directory, Response, jsonify, session, redirect, url_for, flash, render_template, request,send_from_directory
from models import *
from werkzeug.security import generate_password_hash, check_password_hash
from config import Config
from forms import SignupForm, LoginForm
import torch
from ultralytics import YOLO
from flask_socketio import SocketIO
from flask_cors import CORS
from utils import generate_frames
from threading import Event, Thread
from flask_migrate import Migrate
from werkzeug.utils import secure_filename
import os
from sqlalchemy.exc import IntegrityError
import cv2
import numpy as np

from transformers import pipeline

app = Flask(__name__)

CORS(app)
app.config.from_object(Config)

db.init_app(app)
socketio = SocketIO(app, cors_allowed_origins="*")
migrate = Migrate(app, db)  # Uncomment if using Flask-Migrate

device = 'cuda' if torch.cuda.is_available() else 'cpu'
model = YOLO("yolov9e.pt").to(device)
classNames = ["person","person"]

is_streaming_event = Event()
is_streaming_event.set()
stream_thread = None

with app.app_context():
    db.create_all()

@app.route('/homepagedata', methods=['GET'])
def homepage():
    username = session.get('username')
    male_count = db.session.query(GenderDetection).filter(GenderDetection.male_count > 0).count()
    female_count = db.session.query(GenderDetection).filter(GenderDetection.female_count > 0).count()
    total_people = male_count + female_count

    return jsonify({
        'username': username,
        'total_people': total_people,
        'male_count': male_count,
        'female_count': female_count
    })

@app.route('/video_feed')
def video_feed():
    global stream_thread
    if not is_streaming_event.is_set():
        is_streaming_event.set()
        if stream_thread is None or not stream_thread.is_alive():
            stream_thread = Thread(target=lambda: Response(generate_frames(app, db, is_streaming_event), mimetype='multipart/x-mixed-replace; boundary=frame'))
            stream_thread.start()
    return Response(generate_frames(), mimetype='multipart/x-mixed-replace; boundary=frame')

@app.route('/stop_feed', methods=['POST'])
def stop_feed():
    global is_streaming_event
    is_streaming_event.clear()  # Signal the thread to stop streaming
    if stream_thread and stream_thread.is_alive():
        stream_thread.join()  # Wait for the thread to finish
    return jsonify({"status": "Camera stopped"}), 200

@app.route('/chartdata')
def get_data():
    data = db.session.query(GenderDetection).order_by(GenderDetection.timestamp).all()
    chart_data = {
        "timestamps": [entry.timestamp.strftime('%Y-%m-%d %H:%M:%S') for entry in data],
        "male_count": [entry.male_count for entry in data],
        "female_count": [entry.female_count for entry in data]
    }
    return jsonify(chart_data)

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    user = db.session.query(User).filter_by(email=email).first()
    if user and check_password_hash(user.password, password):
        session['username'] = user.username
        return jsonify({"status": "success", "username": user.username}), 200
    return jsonify({"status": "error", "message": "Invalid email or password"}), 401

@app.route('/api/signup', methods=['POST'])
def api_signup():
    data = request.get_json()
    email = data.get('email')
    password = generate_password_hash(data.get('password'), method='sha256')
    confirm_password = data.get('confirm_password')
    username = data.get('username')
    gender = data.get('gender')
    phonenumber = data.get('phonenumber')

    if password != confirm_password:
        return jsonify({"status": "error", "message": "Passwords do not match."}), 400

    new_user = User(email=email, password=password, username=username, gender=gender, phonenumber=phonenumber)
    db.session.add(new_user)
    db.session.commit()
    return jsonify({"status": "success", "message": "Account created successfully!"}), 201

@app.route('/')
def default():
    return render_template('index.html')

    # Render the signup page
    
@app.route('/signup', methods=['POST'])
def signup():
    data = request.form  # Retrieve form data

    # Debugging: Print form data
    print("Received form data:", data)

    email = data.get('email')
    password = data.get('password')
    confirm_password = data.get('confirmPassword')
    gender = data.get('gender')
    username = data.get('username')
    phonenumber = data.get('phonenumber')

    # Debugging: Print the individual fields
    print("Email:", email)
    print("Password:", password)
    print("Confirm Password:", confirm_password)
    print("Gender:", gender)
    print("Username:", username)
    print("Phone Number:", phonenumber)

    # Check if any field is missing
    if not all([email, password, confirm_password, gender, username, phonenumber]):
        return jsonify({'status': 'error', 'message': 'All fields are required'}), 400

    # Check if passwords match
    if password != confirm_password:
        return jsonify({'status': 'error', 'message': 'Passwords do not match'}), 400

    # Hash the password for security
    hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

    # Create a new user instance
    new_user = User(email=email, password=hashed_password, gender=gender, username=username, phonenumber=phonenumber)

    try:
 
        db.session.add(new_user)
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Signup successful! Please log in.'}), 200
    except Exception as e:
        db.session.rollback()
     
        print(f"Exception occurred: {e}")
        return jsonify({'status': 'error', 'message': 'Email already exists. Please use a different email.'}), 400
@app.route('/cctvdata', methods=['GET'])
def get_cctvs():
    cctvs = db.session.query(Cctv).all()
    cctv_list = [
        {
            'cctvid': cctv.cctvid,
            'latitude': cctv.latitude,
            'longitude': cctv.longitude,
            'status': cctv.status,
            'proxyaddress': cctv.proxyaddress
        }
        for cctv in cctvs
    ]
    return jsonify(cctv_list)


@app.route('/api/cctv', methods=['POST'])
def add_cctv():
    
    cctvs = db.session.query(Cctv).all()
    cctv_list = [
        {
            'cctvid': cctv.cctvid,
            'latitude': cctv.latitude,
            'longitude': cctv.longitude,
            'status': cctv.status,
            'proxyaddress': cctv.proxyaddress
        }
        for cctv in cctvs
    ]
    # Assuming cctv_list is your list of CCTV dictionaries
    if cctv_list:
        last_cctv_proxyaddress = cctv_list[-1]['proxyaddress']
        print("Last CCTV proxyaddress:", last_cctv_proxyaddress)
    else:
        print("No CCTV records found.")

    data = request.get_json()

    latitude = data.get('latitude')
    longitude = data.get('longitude')
    status = "active"


    if not latitude or not longitude or not status:
        return jsonify({"status": "error", "message": "All required fields must be provided"}), 400

    new_cctv = Cctv(latitude=latitude, longitude=longitude, status=status, proxyaddress=last_cctv_proxyaddress)
    try:
        db.session.add(new_cctv)
        db.session.commit()
        return jsonify({"status": "success", "message": "CCTV added successfully!"}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"status": "error", "message": str(e)}), 500

@app.route('/api/policestations')
def get_police_stations():
    return send_from_directory('static', 'policestations.json')


classifier = pipeline('text-classification', model='bhadresh-savani/distilbert-base-uncased-emotion')

# Function to classify a single tweet
def classify_tweet(tweet):
    classification = classifier(tweet)
    label = classification[0]['label']
    # Classify as 'Threatening' if 'anger' is detected, otherwise 'Non-threatening'
    if 'anger' in label.lower():
        return "Threatening"
    else:
        return "Non-threatening"

# Route to classify tweets
@app.route('/classify_tweet', methods=['POST'])
def classify_tweet_route():
    data = request.get_json()
    tweet = data.get('tweet', '')
    threat_level = classify_tweet(tweet)
    return jsonify({'threat_level': threat_level})



#Routes for personnels
@app.route('/personnel', methods=['POST'])
def add_personnel():
    data = request.json
    new_personnel = Personnel(
        first_name=data['first_name'],
        last_name=data['last_name'],
        rank=data['rank'],
        phone_number=data['phone_number'],
        email=data['email'],
        address=data['address'],
        date_of_birth=datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date(),
        password=generate_password_hash(data['password'], method='pbkdf2:sha256')
    )
    db.session.add(new_personnel)
    db.session.commit()
    return jsonify({"message": "Personnel added successfully!"}), 201

@app.route('/inventory', methods=['POST'])
def add_inventory2():
    data = request.json
    new_inventory = Inventory(
        item_name=data['item_name'],
        quantity=data['quantity'],
        category=data['category'],
        last_updated=data['last_updated'],
        location_latitude=data['location_latitude'],
        location_longitude=data['location_longitude'],
        added_by_id=data['added_by_id']
    )
    db.session.add(new_inventory)
    db.session.commit()
    return jsonify({"message": "Inventory added successfully!"}), 201

@app.route('/personnel', methods=['GET'])
def get_personnel():
    personnel = Personnel.query.all()
    return jsonify([p.serialize() for p in personnel]), 200

@app.route('/inventory', methods=['GET'])
def get_inventory2():
    inventory = Inventory.query.all()
    return jsonify([i.serialize() for i in inventory]), 200


@app.route('/api/checkpost', methods=['POST'])
def add_checkpost():
    data = request.json
    print(data)
    # Extracting fields from request
    headquarter_id = data.get('headquarter_id')
    checkpostname=data.get('checkpostname')
    latitude = data.get('latitude')
    longitude = data.get('longitude')

    if not headquarter_id or not latitude or not longitude:
        return jsonify({'message': 'Missing fields'}), 400

    try:
        # Create a new Checkpost entry
        new_checkpost = Checkpost(headquarter_id=headquarter_id, latitude=latitude, longitude=longitude,name=checkpostname)
        print(new_checkpost)
        db.session.add(new_checkpost)
        db.session.commit()
        print("success")
        return jsonify({'message': 'Checkpost added successfully!'}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({'message': 'Failed to add checkpost', 'error': str(e)}), 500

@app.route('/api/headquarters', methods=['GET'])
def get_headquarters():
    headquarters = Headquarter.query.all()
    return jsonify([{
        'id': h.id,
        'name': h.name,
        'address': h.address,
        'latitude': h.latitude,
        'longitude': h.longitude
    } for h in headquarters])

@app.route('/api/checkposts', methods=['GET'])
def get_checkposts():
    checkposts = Checkpost.query.all()
    
    return jsonify([{
        'id': cp.id,
        'name': cp.name,
        'headquarter_id': cp.headquarter_id,
        'latitude': cp.latitude,
        'longitude': cp.longitude
    } for cp in checkposts])





# Route to submit form data
@app.route('/add-unit', methods=['POST'])
def add_unit():
    data = request.json
    battalion_name = data.get('battalionName')
    company_name = data.get('companyName')
    platoon_name = data.get('platoonName')
    
    # Fetch or create battalion
    battalion = Battalion.query.filter_by(battalion_name=battalion_name).first()
    if not battalion:
        battalion = Battalion(battalion_name=battalion_name)
        db.session.add(battalion)
        db.session.commit()

    # Fetch or create company
    company = Company.query.filter_by(company_name=company_name, battalion_id=battalion.battalion_id).first()
    if not company:
        company = Company(company_name=company_name, battalion_id=battalion.battalion_id)
        db.session.add(company)
        db.session.commit()

    # Fetch or create platoon
    platoon = Platoon.query.filter_by(platoon_name=platoon_name, company_id=company.company_id).first()
    if not platoon:
        platoon = Platoon(platoon_name=platoon_name, company_id=company.company_id)
        db.session.add(platoon)
        db.session.commit()

    return jsonify({'message': 'Unit added successfully'})



# Rename the function to avoid the conflict
@app.route('/api/get-personnel', methods=['GET'])
def fetch_personnel():
    role = request.args.get('role')
    
    if role:
        personnel_list = Personnel.query.filter_by(rank=role).all()
        personnel_data = [{
            'personnel_id': person.personnel_id,
            'first_name': person.first_name,
            'last_name': person.last_name,
            'rank': person.rank
        } for person in personnel_list]

        return jsonify(personnel_data)
    
    return jsonify([]), 400  # Bad request if role is not provided


# API to fetch all battalions for Company dropdown
@app.route('/api/get-battalions', methods=['GET'])
def get_battalions():
    battalions = Battalion.query.all()
    battalion_list = [{'battalion_id': b.battalion_id, 'battalion_name': b.battalion_name} for b in battalions]
    return jsonify(battalion_list)

# API to fetch all companies for Platoon dropdown
@app.route('/api/get-companies', methods=['GET'])
def get_companies():
    companies = Company.query.all()
    company_list = [{'company_id': c.company_id, 'company_name': c.company_name} for c in companies]
    return jsonify(company_list)

@app.route('/api/get-sections', methods=['GET'])
def get_section():
    section = Section.query.all()
    section_list = [{'section_id': c.section_id, 'section_name': c.section_name} for c in section]
    print(section_list)
    return jsonify(section_list)


@app.route('/api/update-company-head', methods=['POST'])
def update_companies():
    data = request.get_json()
    print(data)
    company_id = data.get('company_id')
    new_head_id = data.get('head_id')
    
    if company_id is None or new_head_id is None:
        return jsonify({'error': 'company_id and head_id are required.'}), 400

    # Find the company by ID
    company = Company.query.get(company_id)
    
    if company is None:
        return jsonify({'error': 'Company not found.'}), 404

    # Update the head_id
    company.head_id = new_head_id
    db.session.commit()  # Commit the changes

    return jsonify({'message': 'Company head updated successfully!'}), 200



@app.route('/api/update-section-head', methods=['POST'])
def update_section():
    data = request.get_json()
    print(data)
    section_id = data.get('section_id')
    new_head_id = data.get('head_id')
    
    if section_id is None or new_head_id is None:
        return jsonify({'error': 'company_id and head_id are required.'}), 400

    # Find the company by ID
    section = Section.query.get(section_id)
    
    if section is None:
        return jsonify({'error': 'Company not found.'}), 404

    # Update the head_id
    section.head_id = new_head_id
    db.session.commit()  # Commit the changes

    return jsonify({'message': 'Company head updated successfully!'}), 200

# API to fetch all platoons for Section dropdown
@app.route('/api/get-platoons', methods=['GET'])
def get_platoons():
    platoons = Platoon.query.all()
    platoon_list = [{'platoon_id': p.platoon_id, 'platoon_name': p.platoon_name} for p in platoons]
    print(platoon_list)
    return jsonify(platoon_list)


@app.route('/api/update-platoon-head', methods=['POST'])
def update_platoon():
    data = request.get_json()
    print(data)
    platoon_id = data.get('platoon_id')
    new_head_id = data.get('head_id')
    
    if platoon_id is None or new_head_id is None:
        return jsonify({'error': 'company_id and head_id are required.'}), 400

    # Find the company by ID
    platoon = Platoon.query.get(platoon_id)
    
    if platoon is None:
        return jsonify({'error': 'Company not found.'}), 404

    # Update the head_id
    platoon.head_id = new_head_id
    db.session.commit()  # Commit the changes

    return jsonify({'message': 'Company head updated successfully!'}), 200

# API to create a new Battalion
@app.route('/api/create-battalion', methods=['POST'])
def create_battalion():
    data = request.json
    battalion = Battalion(battalion_name=data['battalion_name'], commandant_id=data['commandant_id'])
    db.session.add(battalion)
    db.session.commit()
    return jsonify({'message': 'Battalion created successfully'})

# API to create a new Company
@app.route('/api/create-company', methods=['POST'])
def create_company():
    data = request.json
    company = Company(company_name=data['company_name'], battalion_id=data['battalion_id'])
    db.session.add(company)
    db.session.commit()
    return jsonify({'message': 'Company created successfully'})

# API to create a new Platoon
@app.route('/api/create-platoon', methods=['POST'])
def create_platoon():
    data = request.json
    platoon = Platoon(platoon_name=data['platoon_name'], company_id=data['company_id'])
    db.session.add(platoon)
    db.session.commit()
    return jsonify({'message': 'Platoon created successfully'})

@app.route('/api/create-section', methods=['POST'])
def create_section():
    data = request.json
    print(data)
    section= Section(section_name=data['section_name'], platoon_id=data['platoon_id'])
    db.session.add(section)
    db.session.commit()
    return jsonify({'message': 'Section created successfully'})


@app.route('/api/add-sectiondata', methods=['POST'])
def add_sectiondata():
    data = request.json
    print(data)
    section= SectionsData(section_id=data['section_id'], personnel_id=data['constable_id'])
    db.session.add(section)
    db.session.commit()
    return jsonify({'message': 'Constable Section updated successfully'})


@app.route('/api/get-commandants', methods=['GET'])
def get_commandants():
    try:
        # Assuming 'role' is a field in Personnel to filter commandants
        commandants = Personnel.query.filter_by(rank='Commandant').all()
        print(commandants)
        # Prepare the data to send to frontend
        commandant_data = [
            {'personnel_id': c.personnel_id, 'name': 'CO.'+c.first_name+' '+c.last_name} for c in commandants
        ]
        
        return jsonify({'commandants': commandant_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-company-heads', methods=['GET'])
def get_company_heads():
    try:
        # Fetching personnel who are deputies or assistant commandants
        company_heads = Personnel.query.filter(
            (Personnel.rank == 'Deputy Commandant') | (Personnel.rank == 'Assistant Commandant')
        ).all()
        print(company_heads)
        company_head_data = [
            {'personnel_id': c.personnel_id, 'name': 'CO.' + c.first_name + ' ' + c.last_name}
            for c in company_heads
        ]
        print(company_head_data)
        return jsonify({'heads': company_head_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-platoon-heads', methods=['GET'])
def get_platoon_heads():
    try:
        # Fetching personnel who are inspectors or sub-inspectors
        platoon_heads = Personnel.query.filter(
            (Personnel.rank == 'Inspector') | (Personnel.rank == 'Sub-Inspector')
        ).all()
        platoon_head_data = [
            {'personnel_id': p.personnel_id, 'name': 'Ins.' + p.first_name + ' ' + p.last_name}
            for p in platoon_heads
        ]
        print(platoon_head_data)
        return jsonify({'heads': platoon_head_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/get-section-heads', methods=['GET'])
def get_section_heads():
    try:
        # Fetching personnel who are head constables
        section_heads = Personnel.query.filter_by(rank='Head Constable').all()
        section_head_data = [
            {'personnel_id': s.personnel_id, 'name': 'CO.' + s.first_name + ' ' + s.last_name}
            for s in section_heads
        ]
        return jsonify({'heads': section_head_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/get-constable', methods=['GET'])
def get_constable():
    try:
        # Fetching personnel who are inspectors or sub-inspectors
        constable = Personnel.query.filter(
            (Personnel.rank == 'Constable')
        ).all()
        constable_data = [
            {'constable_id': p.personnel_id, 'name': 'Constable.' + p.first_name + ' ' + p.last_name}
            for p in constable
        ]
        print(constable_data)
        return jsonify({'heads': constable_data}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500



@app.route('/api/update-section-checkpost', methods=['POST'])
def update_section_checkpost():
    data = request.get_json()
    print(data)
    section_id = data.get('section_id')
    checkpost = data.get('checkpost_id')
    
    if section_id is None or checkpost is None:
        return jsonify({'error': 'company_id and head_id are required.'}), 400

    # Find the company by ID
    section = Section.query.get(section_id)
    
    if section is None:
        return jsonify({'error': 'Company not found.'}), 404

    # Update the head_id
    section.checkpost_id = checkpost
    db.session.commit()  # Commit the changes

    return jsonify({'message': 'Company head updated successfully!'}), 200
@app.route('/api/get-checkpost-details', methods=['GET'])
def get_checkpost_details():
    # Fetch checkpost details
    checkpost_id=1
    checkpost = Checkpost.query.filter_by(id=checkpost_id).first()

    if not checkpost:
        return {"error": "Checkpost not found"}, 404

    # Fetch platoon, battalion, and company details
    platoon = None
    battalion = None
    company = None

    # Check if the checkpost has sections and get their platoons, battalions, and companies
    if checkpost.sections:
        for section in checkpost.sections:
            platoon = section.platoon
            if platoon:
                battalion = platoon.company.battalion
                company = platoon.company

    # Get heads for platoon, battalion, and company
    platoon_head_info = {
        "head_id": platoon.head.personnel_id if platoon and platoon.head else None,
        "head_name": f"{platoon.head.first_name} {platoon.head.last_name}" if platoon and platoon.head else None,
        "rank": platoon.head.rank if platoon and platoon.head else None,
        "phone": platoon.head.phone_number if platoon and platoon.head else None,
        "email": platoon.head.email if platoon and platoon.head else None
    }

    battalion_head_info = {
        "head_id": battalion.commandant.personnel_id if battalion and battalion.commandant else None,
        "head_name": f"{battalion.commandant.first_name} {battalion.commandant.last_name}" if battalion and battalion.commandant else None,
        "rank": battalion.commandant.rank if battalion and battalion.commandant else None,
        "phone": battalion.commandant.phone_number if battalion and battalion.commandant else None,
        "email": battalion.commandant.email if battalion and battalion.commandant else None
    }

    company_head_info = {
        "head_id": company.head.personnel_id if company and company.head else None,
        "head_name": f"{company.head.first_name} {company.head.last_name}" if company and company.head else None,
        "rank": company.head.rank if company and company.head else None,
        "phone": company.head.phone_number if company and company.head else None,
        "email": company.head.email if company and company.head else None
    }

    # Fetch related sections under the checkpost
    sections_data = []
    for section in checkpost.sections:
        # Get personnel (head) for the section
        head = section.head
        head_info = {
            "head_id": head.personnel_id,
            "head_name": f"{head.first_name} {head.last_name}",
            "rank": head.rank,
            "phone": head.phone_number,
            "email": head.email
        } if head else None

        # Get personnel assigned to the section
        personnel_list = []
        for data in section.sections_data:
            personnel = data.personnel
            personnel_list.append({
                "personnel_id": personnel.personnel_id,
                "personnel_name": f"{personnel.first_name} {personnel.last_name}",
                "rank": personnel.rank,
                "phone": personnel.phone_number,
                "email": personnel.email
            })

        # Add section and personnel info to the sections_data list
        sections_data.append({
            "section_id": section.section_id,
            "section_name": section.section_name,
            "head": head_info,
            "personnel": personnel_list
        })

    # Construct the response
    checkpost_details = {
        "checkpost_id": checkpost.id,
        "checkpost_name": checkpost.name,
        "headquarter": checkpost.headquarter_id,
        "latitude": checkpost.latitude,
        "longitude": checkpost.longitude,
        "platoon": {
            "platoon_id": platoon.platoon_id if platoon else None,
            "platoon_name": platoon.platoon_name if platoon else None,
            "head": platoon_head_info
        },
        "battalion": {
            "battalion_id": battalion.battalion_id if battalion else None,
            "battalion_name": battalion.battalion_name if battalion else None,
            "head": battalion_head_info
        },
        "company": {
            "company_id": company.company_id if company else None,
            "company_name": company.company_name if company else None,
            "head": company_head_info
        },
        "sections": sections_data
    }

    return checkpost_details

def get_checkpost_details_with_context():
    with app.app_context():
        # Call the function to fetch checkpost details within the app context
        return get_checkpost_details()
    
#patrol 
@app.route('/add_patrol', methods=['POST'])
def add_patrol():
    try:
        data = request.json
        print("Received data:", data)

        patrol_name = data['patrol_name']
        checkpost_id = data['checkpost_id']
        constable_count = data['constable_count']

        # Verify checkpost exists
        existing_checkpost = db.session.get(Checkpost, checkpost_id)
        if not existing_checkpost:
            print(f"Checkpost ID {checkpost_id} does not exist.")
            return jsonify({'message': 'Invalid checkpost ID'}), 400

        # Parse start_time and end_time
        start_time_str = data.get('start_time', '')
        end_time_str = data.get('end_time', '')

        def parse_datetime(date_str):
            try:
                return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
            except ValueError:
                return datetime.strptime(date_str, '%Y-%m-%dT%H:%M')

        start_time = parse_datetime(start_time_str)
        end_time = parse_datetime(end_time_str)

        checkpoints = data['checkpoints']
        print("Checkpoints:", checkpoints)

        # Create the Patrol instance
        patrol = Patrol(
            patrol_name=patrol_name,
            checkpost_id=checkpost_id,
            constable_count=constable_count,
            start_time=start_time,
            end_time=end_time
        )

        db.session.add(patrol)
        db.session.commit()
        print("Patrol added to DB with ID:", patrol.id)

        # Add checkpoints
        for i, checkpoint in enumerate(checkpoints):
            new_checkpoint = PatrolCheckpoint(
                patrol_id=patrol.id,
                latitude=checkpoint['latitude'],
                longitude=checkpoint['longitude'],
                order_in_patrol=i
            )
            db.session.add(new_checkpoint)

        db.session.commit()
        print("Checkpoints added successfully")

        return jsonify({'message': 'Patrol added successfully!'}), 201

    except Exception as e:
        print("Error occurred:", str(e))
        return jsonify({'message': 'Failed to add patrol', 'error': str(e)}), 500

    

@app.route('/get_patrols/<int:checkpost_id>', methods=['GET'])
def get_patrols(checkpost_id):
    patrols = Patrol.query.filter_by(checkpost_id=checkpost_id).all()
    result = []
    for patrol in patrols:
        patrol_data = {
            'patrol_name': patrol.patrol_name,
            'constable_count': patrol.constable_count,
            'start_time': patrol.start_time.strftime('%Y-%m-%d %H:%M'),
            'end_time': patrol.end_time.strftime('%Y-%m-%d %H:%M'),
            'checkpoints': [{
                'latitude': checkpoint.latitude,
                'longitude': checkpoint.longitude,
                'order_in_patrol': checkpoint.order_in_patrol
            } for checkpoint in patrol.checkpoints]
        }
        result.append(patrol_data)
    return jsonify(result)

# Get list of checkposts
@app.route('/getcheckposts', methods=['GET'])
def getcheckposts():
    checkposts = Checkpost.query.all()
    checkpost_list = [{'id': c.id, 'name':c.name,'latitude': c.latitude, 'longitude': c.longitude} for c in checkposts]
    return jsonify(checkpost_list)


@app.route('/api/patrols/<int:checkpost_id>', methods=['GET'])
def get_patrolsmap(checkpost_id):
    patrols = Patrol.query.filter_by(checkpost_id=checkpost_id).all()
    data = [{'id': patrol.id, 'name': patrol.patrol_name} for patrol in patrols]
    return jsonify(data)



@app.route('/api/patrol_route/<int:patrol_id>', methods=['GET'])
def get_patrol_route(patrol_id):
    # Query the patrol checkpoints, ordered by their sequence in the patrol
    checkpoints = PatrolCheckpoint.query.filter_by(patrol_id=patrol_id).order_by(PatrolCheckpoint.order_in_patrol).all()
    
    # Structure the data in a way that your frontend expects (a list of coordinates [longitude, latitude])
    coordinates = [[cp.longitude, cp.latitude] for cp in checkpoints]
    
    # Wrap the coordinates in a dict for easier processing in the frontend
    data = {
        'coordinates': coordinates
    }
    
    return jsonify(data)

@app.route('/api/route', methods=['GET'])
def get_route():
    origin = request.args.get('origin')
    destination = request.args.get('destination')
    waypoints = request.args.get('waypoints')

    # Limit number of waypoints or split into multiple requests
    osrm_url = f"https://router.project-osrm.org/route/v1/driving/{origin};{waypoints};{destination}?overview=false&alternatives=true&steps=true"
    
    try:
        response = requests.get(osrm_url, timeout=10)  # Timeout after 10 seconds
        response.raise_for_status()  # Raise error for bad status codes
    except requests.exceptions.RequestException as e:
        return jsonify({'error': f'Failed to fetch route: {str(e)}'}), 500

    return jsonify(response.json())
@app.route('/api/patrol_route2/<int:patrol_id>', methods=['GET'])
def get_patrol_route2(patrol_id):
    checkpoints = PatrolCheckpoint.query.filter_by(patrol_id=patrol_id).order_by(PatrolCheckpoint.order_in_patrol).all()
    
    # Structure the data in a way that your frontend expects (latitude, longitude)
    coordinates = [{'latitude': cp.latitude, 'longitude': cp.longitude} for cp in checkpoints]
    
    return jsonify(coordinates)








#inventory Management

@app.route('/api/inventory', methods=['GET'])
def get_inventory_by_category():
    category = request.args.get('category')
    if category:
        inventories = HeadquarterInventory.query.filter_by(category=category).all()
    else:
        inventories = HeadquarterInventory.query.all()

    return jsonify([{
        'item_id': item.item_id,
        'item_name': item.item_name,
        'category': item.category,
        'quantity': item.quantity,
        'unit': item.unit,
        'image_path': item.image_path,
    } for item in inventories])





UPLOAD_FOLDER = 'uploads'  # Ensure this directory exists
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/api/inventory', methods=['POST'])
def add_inventory():
    data = request.form
    file = request.files.get('image')

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
    else:
        file_path = None

    new_item = HeadquarterInventory(
        item_name=data['item_name'],
        category=data['category'],
        quantity=data['quantity'],
        unit=data['unit'],
       
        image_path=file_path
    )
    
    db.session.add(new_item)
    db.session.commit()
    return jsonify({'message': 'Inventory item added successfully!'}), 201

@app.route('/api/inventory/<int:item_id>', methods=['PUT'])
def update_inventory(item_id):
    item = HeadquarterInventory.query.get_or_404(item_id)
    data = request.form
    file = request.files.get('image')

    if file and allowed_file(file.filename):
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        item.image_path = file_path  # Update the image path if a new image is uploaded

    item.item_name = data['item_name']
    item.category = data['category']
    item.quantity = data['quantity']
    item.unit = data['unit']
    

    db.session.commit()
    return jsonify({'message': 'Inventory updated successfully!'})

@app.route('/api/inventory/<int:item_id>', methods=['DELETE'])
def delete_inventory(item_id):
    item = HeadquarterInventory.query.get_or_404(item_id)
    db.session.delete(item)
    db.session.commit()
    return jsonify({'message': 'Inventory deleted successfully!'})


@app.route('/api/orders', methods=['POST'])
def place_order():
    data = request.json  # Make sure to read the incoming JSON data
    checkpost_id = data.get('checkpost_id')
    orders = data.get('orders')  # Expecting orders to be an array of items

    if not orders:
        return jsonify({'message': 'No orders provided.'}), 400

    for order in orders:
        # Convert item_id and quantity to integers
        item_id = int(order.get('item_id'))  # Make sure this is converted to int
        quantity = int(order.get('quantity'))  # Make sure this is converted to int

        if item_id is None or quantity is None:
            return jsonify({'message': 'Item ID and quantity are required.'}), 400

        # Here you would handle the order processing
        # For example, check if the item exists in inventory,
        # and create a new Order record in the database

        # Example of a placeholder for actual processing logic
        # Check if the item exists and has enough quantity
        item = HeadquarterInventory.query.get(item_id)
        if not item or item.quantity < quantity:
            return jsonify({'message': f'Insufficient quantity for item ID {item_id}.'}), 400

        # Assume you have an Order model to create a new order entry
        new_order = Order(checkpost_id=checkpost_id, item_id=item_id, quantity=quantity,status="pending")
        db.session.add(new_order)

    # Commit the orders to the database
    db.session.commit()

    return jsonify({'message': 'Orders placed successfully!'}), 201

@app.route('/api/categories', methods=['GET'])
def get_categories():
    # Replace this with actual category fetching logic from the database
    categories = ['Food', 'Medical', 'Weapons']  # Example categories
    return jsonify(categories)


@app.route('/api/orders/pending', methods=['GET'])
def get_pending_orders():
    pending_orders = Order.query.filter(Order.status == 'pending').all()
    orders_with_checkpost = []

    for order in pending_orders:
        checkpost = Checkpost.query.get(order.checkpost_id)
        headquarter_item = HeadquarterInventory.query.get(order.item_id)  # Get item details
        orders_with_checkpost.append({
            'order_id': order.order_id,
            'checkpost': {
                'name': checkpost.name,
                # location has been omitted
            },
            'headquarter_item': {
                "item_id": headquarter_item.item_id,
                'item_name': headquarter_item.item_name,
                'unit': headquarter_item.unit,
            },
            'quantity': order.quantity,
            'date_ordered': order.date_ordered,
            'status': order.status,
        })

    return jsonify(orders_with_checkpost)


@app.route('/api/orders/approved', methods=['GET'])
def get_approved_orders():
    approved_orders = Order.query.filter(Order.status == 'approved').all()
    orders_with_checkpost = []

    for order in approved_orders:
        checkpost = Checkpost.query.get(order.checkpost_id)
        headquarter_item = HeadquarterInventory.query.get(order.item_id)
        orders_with_checkpost.append({
            'order_id': order.order_id,
            'checkpost': {
                'name': checkpost.name,
                # location can be omitted if not needed
            },
            'headquarter_item': {
                'item_id': headquarter_item.item_id,
                'item_name': headquarter_item.item_name,
                'unit': headquarter_item.unit,
            },
            'quantity': order.quantity,
            'date_ordered': order.date_ordered,
            'status': order.status,
        })

    return jsonify(orders_with_checkpost)


@app.route('/api/orders/approve', methods=['POST'])
def approve_order():
    data = request.get_json()
    order_id = data['order_id']
    item_id = data['item_id']
    quantity = data['quantity']
    
    # Fetch the order
    order = Order.query.get_or_404(order_id)

    # Check if order is pending before approval
    if order.status != 'pending':
        return jsonify({'message': 'Order cannot be approved.'}), 400
    
    # Fetch the inventory item
    inventory_item = HeadquarterInventory.query.get_or_404(item_id)
    
    # Update inventory quantity
    if inventory_item.quantity >= quantity:
        inventory_item.quantity -= quantity
        order.status = 'approved'  # Update order status

        # Check if the item already exists in CheckpostInventory
        checkpost_inventory_item = CheckpostInventory.query.filter_by(
            checkpost_id=order.checkpost_id, item_id=item_id).first()

        if checkpost_inventory_item:
            # Item exists, update the quantity
            checkpost_inventory_item.quantity += quantity
            checkpost_inventory_item.last_updated = datetime.utcnow()
        else:
            # Item does not exist, create a new entry
            new_checkpost_item = CheckpostInventory(
                checkpost_id=order.checkpost_id,
                item_id=item_id,
                quantity=quantity
            )
            db.session.add(new_checkpost_item)

        db.session.commit()
        return jsonify({'message': 'Order approved successfully!'})
    else:
        return jsonify({'message': 'Insufficient inventory quantity.'}), 400
@app.route('/api/increaseinventory/<int:item_id>', methods=['PUT'])
def increase_inventory(item_id):
    # Parse the JSON data from the request
    data = request.json
    print(f"Incoming data: {data}")  # Debug: Print incoming data
    item_id = int(item_id)
    # Validate the input
    quantity_to_add = data.get('quantity')
    print(f"Quantity to add: {quantity_to_add}")  # Debug: Print quantity

    if quantity_to_add is None:
        return jsonify({"message": "Quantity is required."}), 400
    if not isinstance(quantity_to_add, int) or quantity_to_add <= 0:
        return jsonify({"message": "Quantity must be a positive integer."}), 400
    item = HeadquarterInventory.query.get(1)  # Replace with the actual item ID
    print(item)
    
    items = HeadquarterInventory.query.all()
    print(f"All items in inventory: {items}")
    # Retrieve the item from the database
    item = HeadquarterInventory.query.filter_by(item_id=item_id).first()
    print(item)
    
    if not item:
        print(f"Item with ID {item_id} not found in the database.")  # Debugging output
        return jsonify({"message": "Item not found."}), 404

    # Increase the item's quantity
    item.quantity += quantity_to_add
    db.session.commit()

    return jsonify({"message": "Stock increased successfully."}), 200


@app.route('/api/consumption/checkposts', methods=['GET'])
def get_consum_checkposts():
    checkposts = Checkpost.query.all()
    return jsonify([{'id': checkpost.id, 'name': checkpost.name} for checkpost in checkposts])

@app.route('/api/consumption/personnel', methods=['GET'])
def get_consum_personnel():
    personnel = Personnel.query.all()
    return jsonify([{
        'personnel_id': person.personnel_id,
        'first_name': person.first_name,
        'last_name': person.last_name,
        'rank': person.rank,
    } for person in personnel])

@app.route('/uploads/<path:filename>', methods=['GET'])
def upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

@app.route('/api/consumption/inventory', methods=['GET'])
def get_consum_inventory():
    checkpost_id = request.args.get('checkpost')
    items = HeadquarterInventory.query.all()  # You might want to filter by checkpost
    return jsonify([{
        'item_id': item.item_id,
        'item_name': item.item_name,
        'unit': item.unit,
        'image_path': item.image_path  # Assuming you have this field
    } for item in items])


@app.route('/api/consumption/log', methods=['POST'])
def log_consumption():
    data = request.json
    personnel_id = data.get('personnel_id')
    checkpost_id = data.get('checkpost_id')
    item_id = data.get('item_id')
    quantity_consumed = data.get('quantity_consumed')

    # Check if the item exists in the CheckpostInventory
    checkpost_item = CheckpostInventory.query.filter_by(checkpost_id=checkpost_id, item_id=item_id).first()
    
    if not checkpost_item:
        return jsonify({"message": "Item not found in checkpost inventory."}), 404

    # Check if there's enough quantity to consume
    if checkpost_item.quantity < int(quantity_consumed):
        return jsonify({"message": "Insufficient quantity in inventory."}), 400

    # Create a new consumption log
    consumption_log = ConsumptionLog(
        personnel_id=personnel_id,
        checkpost_id=checkpost_id,
        item_id=item_id,
        quantity_consumed=quantity_consumed
    )

    # Decrease the quantity in CheckpostInventory
    checkpost_item.quantity -= int(quantity_consumed)

    # Add to the session and commit
    try:
        db.session.add(consumption_log)
        db.session.commit()
        return jsonify({"message": "Consumption logged successfully."}), 201
    except IntegrityError:
        db.session.rollback()
        return jsonify({"message": "Failed to log consumption. Please try again."}), 500
wmodel = YOLO('set3_150_8m.pt')

@app.route('/predict', methods=['POST'])
def predict():
    file = request.files['image']
    
    # Read the image
    img_bytes = np.frombuffer(file.read(), np.uint8)
    image = cv2.imdecode(img_bytes, cv2.IMREAD_COLOR)

    # Make prediction using YOLOv8
    results = wmodel(image)

    # Extract bounding boxes, labels, and confidence scores
    predictions = []
    for result in results:
        boxes = result.boxes.xyxy.cpu().numpy()  # xyxy bounding box format
        confs = result.boxes.conf.cpu().numpy()  # confidence scores
        labels = result.boxes.cls.cpu().numpy()  # class IDs

        for box, conf, label in zip(boxes, confs, labels):
            predictions.append({
                'label': int(label),  # Convert class ID to int
                'score': float(conf),  # Convert confidence to float
                'box': [float(x) for x in box]  # Bounding box coordinates as float
            })

    return jsonify(predictions)


if __name__ == '__main__':
    socketio.run(app, debug=True, port=5000)
