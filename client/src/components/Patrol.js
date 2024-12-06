import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import axios from 'axios';
import 'leaflet-routing-machine';
import "../static/patrol.css"

const PatrolForm = () => {
    const [patrolName, setPatrolName] = useState('');
    const [constableCount, setConstableCount] = useState(0);
    const [checkpoints, setCheckpoints] = useState([]);
    const [startTime, setStartTime] = useState('');
    const [endTime, setEndTime] = useState('');
    const [checkposts, setCheckposts] = useState([]);
    const [selectedCheckpost, setSelectedCheckpost] = useState(null);
    const [showRoute, setShowRoute] = useState(false);
    const [mapCenter, setMapCenter] = useState([51.505, -0.09]); // Default map center

    // Fetch checkposts when component loads
    useEffect(() => {
        const fetchCheckposts = async () => {
            const response = await axios.get('/getcheckposts');
            setCheckposts(response.data);
        };
        fetchCheckposts();
    }, []);

    // Add a checkpoint on map click
    const addCheckpoint = (lat, lng) => {
        setCheckpoints((prevCheckpoints) => [...prevCheckpoints, { latitude: lat, longitude: lng }]);
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCheckpost) {
            alert('Please select a checkpost');
            return;
        }

        // Ensure first and last checkpoint are the selected checkpost's lat/lng
        const newCheckpoints = [
            { latitude: selectedCheckpost.latitude, longitude: selectedCheckpost.longitude },
            ...checkpoints,
            { latitude: selectedCheckpost.latitude, longitude: selectedCheckpost.longitude }
        ];

        const newPatrol = {
            patrol_name: patrolName,
            checkpost_id: selectedCheckpost.id,
            constable_count: constableCount,
            start_time: startTime,
            end_time: endTime,
            checkpoints: newCheckpoints
        };

        await axios.post('/add_patrol', newPatrol);
        alert('Patrol added!');
    };

    // Display route with Leaflet Routing Machine
    const displayRoute = () => {
        setShowRoute(true);
    };

    // Fly to the selected checkpost when it's selected
    const flyToCheckpost = (lat, lng) => {
        setMapCenter([lat, lng]);
    };

    // Add checkpoint marker on map click
    const AddCheckpointMarker = () => {
        useMapEvents({
            click(e) {
                addCheckpoint(e.latlng.lat, e.latlng.lng);
            },
        });
        return null;
    };

    // Control for flying to the selected checkpost
    const FlyToLocation = ({ lat, lng }) => {
        const map = useMap();
        useEffect(() => {
            if (lat && lng) {
                map.flyTo([lat, lng], 13);
            }
        }, [lat, lng, map]);
        return null;
    };

    return (
        <div>
            <div className="patrolformcontainer">
            <h2>Add Patrol Routes</h2>
            <form id="patrolform" onSubmit={handleSubmit}>
                <div className='patrolforminputs'>
                <label className= "control-label">Enter Patrol Unit Name: </label>
                <input
                    type="text"
                    placeholder="Patrol Name"
                    value={patrolName}
                    onChange={(e) => setPatrolName(e.target.value)}
                    required
                />

                </div>
                <div className='patrolforminputs'>
                <label className= "control-label">Select Number of Personnel: </label>
                <input
                    type="number"
                    placeholder="Number of Constables"
                    value={constableCount}
                    onChange={(e) => setConstableCount(e.target.value)}
                    required
                />
                </div>
                <div className='patrolforminputs'>
                <label className= "control-label">Select Checkpost:</label>
                <select
                    onChange={(e) => {
                        const selected = checkposts.find(c => c.id === parseInt(e.target.value));
                        setSelectedCheckpost(selected);
                        setCheckpoints([]); // Reset checkpoints when new checkpost is selected
                        if (selected) flyToCheckpost(selected.latitude, selected.longitude); // Fly to the selected checkpost
                    }}
                    required
                >
                  
                    <option value="">Select a checkpost</option>
                    {checkposts.map((checkpost) => (
                        <option key={checkpost.id} value={checkpost.id}>
                            {checkpost.name}
                        </option>
                    ))}
                </select>
                </div>
                <div className='patrolforminputs'>
                <label className= "control-label">Select Start Date :</label>
                <input
                    type="datetime-local"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                />
                </div>
                <div className='patrolforminputs'>
                <label className= "control-label">Select End Date:</label>
                <input
                    type="datetime-local"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                />
                </div>
                <label className= "control-label">Select Patrol Route Checkpoints from the map</label>
                <MapContainer center={mapCenter} zoom={9} style={{ height: '230px' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {checkpoints.map((point, idx) => (
                        <Marker key={idx} position={[point.latitude, point.longitude]} />
                    ))}
                    {selectedCheckpost && (
                        <FlyToLocation lat={selectedCheckpost.latitude} lng={selectedCheckpost.longitude} />
                    )}
                    <AddCheckpointMarker />
                </MapContainer>

                <button id="patrolformbutton" type="submit">Submit Patrol</button>
            </form>

            <button style={{display:"none"}}onClick={displayRoute}>Display Route</button>

            {showRoute && selectedCheckpost && checkpoints.length > 0 && (
                <MapContainer center={mapCenter} zoom={13} style={{ height: '400px' }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <RoutingMachine checkpoints={checkpoints} />
                </MapContainer>
            )}
            </div>
        </div>
    );
};

// Leaflet Routing Machine component
const RoutingMachine = ({ checkpoints }) => {
    const map = useMap();
    useEffect(() => {
        if (map) {
            const routingControl = L.Routing.control({
                waypoints: checkpoints.map((point) => L.latLng(point.latitude, point.longitude)),
                routeWhileDragging: true,
            }).addTo(map);

            return () => {
                map.removeControl(routingControl);
            };
        }
    }, [map, checkpoints]);

    return null;
};

export default PatrolForm;
