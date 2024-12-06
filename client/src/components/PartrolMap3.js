import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import axios from 'axios';

function PatrolMap() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [patrols, setPatrols] = useState([]);
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [route, setRoute] = useState([]);
  const mapRef = useRef(null);

  useEffect(() => {
    axios.get('/getcheckposts')
      .then(response => setCheckpoints(response.data))
      .catch(error => console.error('Error fetching checkpoints:', error));
  }, []);

  useEffect(() => {
    if (selectedCheckpoint) {
      axios.get(`/api/patrols/${selectedCheckpoint}`)
        .then(response => setPatrols(response.data))
        .catch(error => console.error('Error fetching patrols:', error));
    }
  }, [selectedCheckpoint]);

  useEffect(() => {
    if (selectedPatrol) {
      const coords = route.map(cp => `${cp.longitude},${cp.latitude}`).join(';');
      axios.get(`/route?coords=${coords}`)
        .then(response => setRoute(response.data.routes))
        .catch(error => console.error('Error fetching patrol route:', error));
    }
  }, [selectedPatrol]);

  useEffect(() => {
    if (mapRef.current && route.length > 0) {
      const map = mapRef.current;
      const waypoints = route.map(cp => L.latLng(cp.latitude, cp.longitude));

      L.Routing.control({
        waypoints: waypoints,
        routeWhileDragging: true,
        fitSelectedRoutes: true
      }).addTo(map);
    }
  }, [route]);

  return (
    <div>
      <h1>Patrol Route Finder</h1>
      <div>
        <label>Select Checkpoint:</label>
        <select onChange={(e) => setSelectedCheckpoint(e.target.value)}>
          <option value="">Select...</option>
          {checkpoints.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>
      {selectedCheckpoint && (
        <div>
          <label>Select Patrol:</label>
          <select onChange={(e) => setSelectedPatrol(e.target.value)}>
            <option value="">Select...</option>
            {patrols.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      )}
      {selectedPatrol && (
        <MapContainer center={[19.0760, 72.8777]} zoom={13} style={{ height: "600px", width: "100%" }} ref={mapRef}>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        </MapContainer>
      )}
    </div>
  );
}

export default PatrolMap;
