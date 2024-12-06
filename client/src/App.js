import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import Dashboard3 from './components/Dashboard3';
import '@fortawesome/fontawesome-free/css/all.min.css';
import Monitor from './components/Monitor';
import LoginForm from './components/Login'; // Ensure this path is correct
import SignupForm from './components/Signup'; // Import the Signup form
import Topbar from './components/Topbar';
 // Import the GradioApp component
import CctvForm from './components/CctvPage';
import MapsComponent from './components/MapsComponent'; // Import the Maps component
import PoliceStationsMap from './components/Policestationmap';
import TweetComponent from './components/Tweetpage';
import AddPersonnel from './components/AddPersonnel';
import PersonnelMappingForm from './components/PersonnelMapping';
import CheckpostForm from './components/CheckpostForm';
import FormPage from './components/Mappersonnel';
import CheckpostHierarchy from './components/CheckpostHierarchy';
import PatrolForm from './components/Patrol';
import PatrolMap2 from './components/PatrolMap2';
import PatrolMap from './components/PatrolMap2';
import PatrolMap3 from './components/PartrolMap3';
import AddInventroy from './components/AddInventory';
import OrderForm from './components/OrderForm';
import PendingOrders from './components/PendingOrders';
import ConsumptionLogForm from './components/ConsumptionForm';
import Satellite from './components/SatellitePred';
import WeaponDetection from './components/Weapondetection';
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState(''); // Store username here

  const handleLogin = (username) => {
    setIsAuthenticated(true); // Set authentication status to true
    setUsername(username);    // Store the username
  };

  const handleLogout = () => {
    setIsAuthenticated(false); // Set authentication status to false
    setUsername(''); // Clear the username on logout
  };

  return (
    <Router>
      <Routes>
        {/* Route for login */}
        <Route
          path="/login"
          element={!isAuthenticated ? <LoginForm onLogin={handleLogin} /> : <Navigate to="/homepage" />}
        />

        {/* Route for signup */}
        <Route
          path="/signup"
          element={!isAuthenticated ? <SignupForm /> : <Navigate to="/homepage" />}
        />
  
        {/* Protected routes */}
        <Route
          path="/homepage"
          element={isAuthenticated ? (
          
            <div className="box">
            
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
           
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <Dashboard3 />
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

        <Route
          path="/monitor"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <Monitor />
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

<Route
          path="/tweet"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <TweetComponent/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        /> 

      <Route
          path="/location"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
             <MapsComponent/> 
            {/* <PoliceStationsMap/>*/}
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />


        

      <Route
          path="/cctvpage"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
                <CctvForm/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />
         <Route
          path="/addpersonnel"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
           <AddPersonnel/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

<Route
          path="/checkpost"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
           <CheckpostForm/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

<Route
          path="/mappersonnel"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
           <FormPage/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />
<Route
          path="/patrolform"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
           <PatrolForm/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />


<Route
          path="/patrol"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
           <PatrolMap2/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />


<Route
          path="/checkpostHierarchy"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
       <CheckpostHierarchy/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />



<Route
          path="/addInventory"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
       <AddInventroy/>
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />



<Route
          path="/PlaceOrder"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
            
       <OrderForm checkpostId={1} />
    
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />


<Route
          path="/satellite"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
             <Satellite/>
     
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />

<Route
          path="/Consumption"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
            
       <ConsumptionLogForm />
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />


<Route
          path="/weapon"
          element={isAuthenticated ? (
            <div className="box">
              <div className="box_left">
                <Navbar onLogout={handleLogout} username={username} /> {/* Pass username to Navbar */}
              </div>
              <div className="box_right" id="box_rightid">
              <Topbar/>
            
       <WeaponDetection />
              </div>
            </div>
          ) : (
            <Navigate to="/login" />
          )}
        />


        {/* Redirect to login if no other route matches */}
        <Route path="/" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
