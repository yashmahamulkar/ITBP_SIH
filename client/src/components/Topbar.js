import React, { useState, useEffect, useRef } from 'react';
import '../static/topbar.css'; // Import the CSS file

const Topbar = () => {
    const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);
    const [isProfilePanelOpen, setProfilePanelOpen] = useState(false);

    // Create references for notification and profile panels
    const notificationRef = useRef(null);
    const profileRef = useRef(null);

    // Retrieve username from local storage (or use fallback)
    var username = localStorage.getItem('username') || 'Yash';

    // Toggle notification panel visibility and close profile panel if open
    const toggleNotificationPanel = () => {
        setNotificationPanelOpen(!isNotificationPanelOpen);
        setProfilePanelOpen(false); // Close profile panel when opening notification panel
    };

    // Toggle profile panel visibility and close notification panel if open
    const toggleProfilePanel = () => {
        setProfilePanelOpen(!isProfilePanelOpen);
        setNotificationPanelOpen(false); // Close notification panel when opening profile panel
    };

    // Close panels when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            // Debugging log to see where the click is happening
            console.log('Clicked outside, checking refs...');

            // Close notification panel if click is outside
            if (notificationRef.current && !notificationRef.current.contains(event.target)) {
                console.log('Click outside notification panel, closing...');
                setNotificationPanelOpen(false);
            }

            // Close profile panel if click is outside
            if (profileRef.current && !profileRef.current.contains(event.target)) {
                console.log('Click outside profile panel, closing...');
                setProfilePanelOpen(false);
            }
        };

        // Add the event listener to the document
        document.addEventListener('mousedown', handleClickOutside);
        
        // Cleanup the event listener when the component unmounts
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="topbar">

            <div className="search-bar">
                <input type="text" placeholder="Search..." className="search-input" />
                <i className="fa-solid fa-magnifying-glass search-icon"></i>
            </div>
            <div className="notification-bell" onClick={toggleNotificationPanel}>
                <i className="fa-regular fa-bell"></i>
            </div>
            <div className="user-photo" onClick={toggleProfilePanel}>
                <img
                    src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkiIFjCOZ-mMeqxd2ryrneiHedE8G9S0AboA&s"
                    alt="User"
                    className="user-photo-img"
                />
            </div>

            {/* Notification Panel */}
            {isNotificationPanelOpen && (
                <div className="notification-panel" ref={notificationRef}>
               
                    <ul>
                        <li>Notification 1</li>
                        <li>Notification 2</li>
                        <li>Notification 3</li>
                    </ul>
                </div>
            )}

            {/* Profile Panel */}
            {isProfilePanelOpen && (
                <div className="profile-panel" ref={profileRef}>
                    <div className="profile-photo-center">
                        <img
                            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkiIFjCOZ-mMeqxd2ryrneiHedE8G9S0AboA&s"
                            alt="Profile"
                            className="profile-photo-img"
                        />
                    </div>
                    <p>{username}</p>
                
                </div>
            )}
        </div>
    );
};

export default Topbar;
