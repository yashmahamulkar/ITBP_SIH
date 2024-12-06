import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import axios from 'axios';

function PatrolMap() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [patrols, setPatrols] = useState([]);
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [route, setRoute] = useState([]);

  // Fetch checkpoints
  useEffect(() => {
    axios.get('/getcheckposts')
      .then(response => setCheckpoints(response.data))
      .catch(error => console.error('Error fetching checkpoints:', error));
  }, []);

  // Fetch patrols based on selected checkpoint
  useEffect(() => {
    if (selectedCheckpoint) {
      axios.get(`/api/patrols/${selectedCheckpoint}`)
        .then(response => setPatrols(response.data))
        .catch(error => console.error('Error fetching patrols:', error));
    }
  }, [selectedCheckpoint]);

  // Fetch patrol route based on selected patrol
  useEffect(() => {
    if (selectedPatrol) {
      axios.get(`/api/patrol_route/${selectedPatrol}`)
        .then(response => setRoute(response.data))
        .catch(error => console.error('Error fetching patrol route:', error));
    }
  }, [selectedPatrol]);

  // Component for handling map updates
  const MapUpdater = () => {
    const map = useMap();
    
    useEffect(() => {
      if (route.length > 0) {
        const waypoints = route.map(cp => L.latLng(cp.latitude, cp.longitude));

        // Remove previous routing control if exists
        if (map.routingControl) {
          map.removeControl(map.routingControl);
        }

        // Add new routing control
        const routingControl = L.Routing.control({
          waypoints: waypoints,
          routeWhileDragging: true,
          fitSelectedRoutes: true
        }).addTo(map);

        // Store routing control on the map instance for future reference
        map.routingControl = routingControl;

        // Clean up on unmount
        return () => {
          map.removeControl(routingControl);
        };
      }
    }, [route, map]);

    return null; // No UI, just a side effect
  };

  return (
    <div>
      <h1>Patrol Route Finder</h1>

      {/* Dropdown for checkpoint selection */}
      <div>
        <label>Select Checkpoint:</label>
        <select onChange={(e) => setSelectedCheckpoint(e.target.value)}>
          <option value="">Select...</option>
          {checkpoints.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Dropdown for patrol selection, shown only after selecting a checkpoint */}
      {selectedCheckpoint && (
        <div>
          <label>Select Patrol:</label>
          <select onChange={(e) => setSelectedPatrol(e.target.value)}>
            <option value="">Select...</option>
            {patrols.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Map for showing patrol route, shown only after selecting a patrol */}
      {selectedPatrol && (
        <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: "600px", width: "100%" }}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          <MapUpdater />
        </MapContainer>
      )}
    </div>
  );
}

export default PatrolMap;
