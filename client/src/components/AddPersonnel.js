// src/AddPersonnel.js

import React, { useState } from 'react';
import axios from 'axios';
import "../static/addPersonnel.css";
import Commandant from '../static/images/commandant.png';
import Deputycommandant from '../static/images/deputycommandant.png';
import AssistantCommandant from '../static/images/assistantcommandant.png';
import Inspector from '../static/images/inspector.png';
import SubInspector from '../static/images/subinspector.png';
import HeadConstables from '../static/images/headconstable.png';
import Constable from '../static/images/constable.png';
const RANK_IMAGES = {
  "Commandant": Commandant,
  "Deputy Commandant": Deputycommandant,
  "Assistant Commandant": AssistantCommandant,
  "Inspector": Inspector,
  "Sub-Inspector": SubInspector,
  "Head Constable": HeadConstables,
  "Constable": Constable
};

function AddPersonnel() {
  const [personnel, setPersonnel] = useState({
    first_name: '',
    last_name: '',
    rank: '',
    phone_number: '',
    email: '',
    address: '',
    date_of_birth: '',
    password: '',
    confirm_password: '',
  });

  const [rankImage, setRankImage] = useState('');

  const handleRankChange = (e) => {
    const selectedRank = e.target.value;
    setPersonnel({ ...personnel, rank: selectedRank });
    setRankImage(RANK_IMAGES[selectedRank] || ''); // Set image based on selected rank
  };

  const handlePersonnelSubmit = async (e) => {
    e.preventDefault();

    if (personnel.password !== personnel.confirm_password) {
      alert("Passwords do not match!");
      return;
    }
    
    const { confirm_password, date_of_birth, ...dataToSubmit } = personnel;
    const dob = new Date(date_of_birth);
    dataToSubmit.date_of_birth = dob.toISOString().split('T')[0];
    try {
      await axios.post('http://localhost:5000/personnel', dataToSubmit);
      alert('Personnel added successfully');
      setPersonnel({
        first_name: '',
        last_name: '',
        rank: '',
        phone_number: '',
        email: '',
        address: '',
        date_of_birth: '',
        password: '',
        confirm_password: '',
      });
      setRankImage(''); // Reset image on successful submission
    } catch (error) {
      console.error(error);
      alert('Failed to add personnel');
    }
  };

  return (
    
    <div className='mainpersonnelcontainer'>
      
    
      <div className="PersonnelContainer">
      <h1>Add Personnel</h1>  
        <form onSubmit={handlePersonnelSubmit} id="form">
          <div className='upperform'>
            <div className='leftform'>
              {/* First Name Field */}
              <div className="input-group">
                <label>First Name:</label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={personnel.first_name}
                  onChange={(e) => setPersonnel({ ...personnel, first_name: e.target.value })}
                  required
                />
              </div>

              {/* Last Name Field */}
              <div className="input-group">
                <label>Last Name:</label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={personnel.last_name}
                  onChange={(e) => setPersonnel({ ...personnel, last_name: e.target.value })}
                  required
                />
              </div>

              {/* Rank Selection */}
              <div className="input-group">
                <label>Select Rank:</label>
                <select value={personnel.rank} id="selectrank"onChange={handleRankChange} required>
                  <option value="">Select Rank</option>
                  {["Commandant", "Deputy Commandant", "Assistant Commandant", "Inspector", "Sub-Inspector", "Head Constable", "Constable"].map((rank) => (
                    <option key={rank} value={rank}>{rank}</option>
                  ))}
                </select>
              </div>

              {/* Phone Number Field */}
              <div className="input-group">
                <label>Phone Number:</label>
                <input
                  type="text"
                  placeholder="Phone Number"
                  value={personnel.phone_number}
                  onChange={(e) => setPersonnel({ ...personnel, phone_number: e.target.value })}
                  required
                />
              </div>

              {/* Address Field */}
              <div className="input-group">
                <label>Address:</label>
                <input
                  type="text"
                  placeholder="Address"
                  value={personnel.address}
                  onChange={(e) => setPersonnel({ ...personnel, address: e.target.value })}
                  required
                />
              </div>

              {/* Date of Birth Field */}
              <div className="input-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  value={personnel.date_of_birth}
                  onChange={(e) => setPersonnel({ ...personnel, date_of_birth: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="midform">
              

              {/* Email Field */}
              <div className="input-group">
                <label>Email:</label>
                <input
                  type="email"
                  placeholder="Email"
                  value={personnel.email}
                  onChange={(e) => setPersonnel({ ...personnel, email: e.target.value })}
                  required
                />
              </div>

              {/* Password Field */}
              <div className="input-group">
                <label>Password:</label>
                <input
                  type="password"
                  placeholder="Password"
                  value={personnel.password}
                  onChange={(e) => setPersonnel({ ...personnel, password: e.target.value })}
                  required
                />
              </div>

              {/* Confirm Password Field */}
              <div className="input-group">
                <label>Confirm Password:</label>
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={personnel.confirm_password}
                  onChange={(e) => setPersonnel({ ...personnel, confirm_password: e.target.value })}
                  required
                />
              </div>
            </div>
            <div className='rankimage'>
            {rankImage && <img id="rankimageinside" src={rankImage} alt={`Image of ${personnel.rank}`} />}
          
            </div>
            </div>

          <div>
            <button type="submit">Add Personnel</button>
          </div>
        </form>
      </div>
      </div>

  );
}

export default AddPersonnel;
