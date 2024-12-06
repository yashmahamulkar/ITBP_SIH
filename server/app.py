from flask import Flask, render_template, request, redirect, url_for, flash, session,Response,jsonify,get_flashed_messages
from models import db, User,GenderDetection
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash
from forms import LoginForm
from utils import *
#from flask_socketio import SocketIO

from flask_cors import CORS

app = Flask(__name__)
CORS(app)

app.config.from_object(Config)
#socketio = SocketIO(app)
#CORS(app)

db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/homepagedata', methods=['GET'])
def homepage():
    username = session.get('username')  # Get the user email from session

    # Query to get total number of people, males, and females
    male_count = db.session.query(GenderDetection).filter(GenderDetection.male_count > 0).count()
    female_count = db.session.query(GenderDetection).filter(GenderDetection.female_count > 0).count()
    total_people = male_count + female_count

    # Return data as JSON
    return jsonify({
        'username': username,
        'total_people': total_people,
        'male_count': male_count,
        'female_count': female_count
    })
    
    
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        gender = request.form['gender']
        name=request.form['username']
        phone = request.form['phonenumber']
        

        if password != confirm_password:
            flash('Passwords do not match', 'error')
            return redirect(url_for('signup'))

        hashed_password = generate_password_hash(password, method='pbkdf2:sha256')

        new_user = User(email=email, password=hashed_password, gender=gender,username=name,phonenumber=phone)

        try:
            db.session.add(new_user)
            db.session.commit()
            flash('Signup successful! Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash('Email already exists. Please use a different email.', 'error')
            return redirect(url_for('signup'))

    return render_template('signup.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    form = LoginForm()  # Create an instance of the LoginForm

    if request.method == 'POST' and form.validate_on_submit():
        email = form.email.data
        password = form.password.data

        user = User.query.filter_by(email=email).first()

        if user and check_password_hash(user.password, password):
            session['user_id'] = user.id
            session['username'] = user.username  # Store email in session
          #  flash('Login successful!', 'success')
           # print('Login successful')
            return redirect(url_for('homepage'))
        else:
            flash('Invalid email or password', 'error')
            return redirect(url_for('login'))

    return render_template('login.html', form=form)

@app.route('/monitor')
def video_feed():
    return Response(generate_frames(app,db), mimetype='multipart/x-mixed-replace;boundary=frame')
@app.route('/sos', methods=['POST'])
def snworker():
    try:
        json_data = request.get_json()
        sos_mess = str(json_data.get('sos'))
        if sos_mess:
#            socketio.emit('update_content', {'data': sos_mess})
            return jsonify({'status': 'Message received'}), 200  
        else:
            return jsonify({'status': 'No SOS message provided'}), 400 
    except Exception as e:
        return jsonify({"error": str(e)}), 500
@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('user_email', None)  # Remove email from session
    flash('You have been logged out.', 'info')
    return redirect(url_for('login'))

@app.route('/data')
def get_data():
    data = db.session.query(GenderDetection).order_by(GenderDetection.timestamp).all()
    chart_data = {
        "timestamps": [entry.timestamp.strftime('%Y-%m-%d %H:%M:%S') for entry in data],
        "male_count": [entry.male_count for entry in data],
        "female_count": [entry.female_count for entry in data]
    }
    return jsonify(chart_data)  


@app.route('/')
def default():
    if 'user_id' not in session:
        return redirect(url_for('login'))
    return redirect(url_for('homepage'))  

#@app.route('/monitor2')
#def monitor2():
#    return render_template('monitor2.html')


if __name__ == '__main__':
    app.run(debug=True)
