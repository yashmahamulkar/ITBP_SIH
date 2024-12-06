import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import axios from 'axios';
import starticon from "../static/images/marker.png";
import red from "../static/images/route.jpg";

const OPENROUTESERVICE_API_KEY = '5b3ce3597851110001cf6248136e76c3803f4f1fb6aaeee13c3ee312'; // Replace with your ORS API key

// Function to decode polyline
const decodePolyline = (encoded) => {
  const coordinates = [];
  let index = 0;
  const length = encoded.length;
  let lat = 0;
  let lng = 0;

  while (index < length) {
    let b;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLat = (result >> 1) ^ (-(result & 1));
    lat += deltaLat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);
    const deltaLng = (result >> 1) ^ (-(result & 1));
    lng += deltaLng;

    coordinates.push([lat / 1E5, lng / 1E5]);
  }
  return coordinates.map(coord => L.latLng(coord[0], coord[1]));
};

function PatrolMap2() {
  const [checkpoints, setCheckpoints] = useState([]);
  const [selectedCheckpoint, setSelectedCheckpoint] = useState(null);
  const [patrols, setPatrols] = useState([]);
  const [selectedPatrol, setSelectedPatrol] = useState(null);
  const [route, setRoute] = useState([]);
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const polylineRef = useRef(null); // Ref for the polyline

  // Fetch checkpoints
  useEffect(() => {
    const fetchCheckpoints = async () => {
      try {
        const response = await axios.get('/getcheckposts');
        setCheckpoints(response.data);
      } catch (error) {
        console.error('Error fetching checkpoints:', error);
      }
    };
    fetchCheckpoints();
  }, []);

  // Fetch patrols based on selected checkpoint
  useEffect(() => {
    const fetchPatrols = async () => {
      if (selectedCheckpoint) {
        try {
          const response = await axios.get(`/api/patrols/${selectedCheckpoint}`);
          setPatrols(response.data);
        } catch (error) {
          console.error('Error fetching patrols:', error);
        }
      } else {
        setPatrols([]);
      }
    };
    fetchPatrols();
  }, [selectedCheckpoint]);

  // Fetch patrol route using OpenRouteService API
  useEffect(() => {
    const fetchPatrolRoute = async () => {
      if (selectedPatrol) {
        try {
          const response = await axios.get(`/api/patrol_route/${selectedPatrol}`);
          if (response.data && response.data.coordinates && response.data.coordinates.length > 0) {
            const coords = response.data.coordinates;
            const orsResponse = await axios.post(
              `https://api.openrouteservice.org/v2/directions/driving-car`,
              { coordinates: coords },
              {
                headers: {
                  'Authorization': `Bearer ${OPENROUTESERVICE_API_KEY}`,
                  'Content-Type': 'application/json',
                },
              }
            );

            if (orsResponse.data.routes.length > 0) {
              const waypoints = decodePolyline(orsResponse.data.routes[0].geometry);
              setRoute(waypoints);
            } else {
              console.log('No routes found for the selected patrol.');
              setRoute([]);
            }
          } else {
            console.log('No coordinates found for the selected patrol.');
            setRoute([]);
          }
        } catch (error) {
          console.error('Error fetching patrol route:', error);
        }
      }
    };
    fetchPatrolRoute();
  }, [selectedPatrol]);

  // Update map when route is fetched
  useEffect(() => {
    if (mapRef.current && route.length > 0) {
      const map = mapRef.current;

      // Remove existing routing control if it exists
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      // Add new routing control with custom options
      routingControlRef.current = L.Routing.control({
        waypoints: route,
        routeWhileDragging: false,
        fitSelectedRoutes: true,
        show: false,
        lineOptions: {
          styles: [
            {
              color: '#ff5733', // Custom color for route line
              weight: 4, // Width of the route line
              opacity: 0.7, // Opacity of the route line
            },
          ],
        },
        createMarker: function () {
          return null; // No marker for waypoints
        },
      }).addTo(map);

      // Remove previous polyline if it exists
      if (polylineRef.current) {
        polylineRef.current.remove();
      }

      // Add new polyline to connect waypoints
      polylineRef.current = L.polyline(route, {
        color: '#3388ff', // Blue color for the polyline
        weight: 4,
        opacity: 0.75,
      }).addTo(map);

      // Fit the map bounds to the polyline
      map.fitBounds(polylineRef.current.getBounds());
    }
  }, [route]);

  return (
    <div>
      <h1>Patrol Route Finder</h1>

      <div>
        <label>Select Checkpoint:</label>
        <select onChange={(e) => setSelectedCheckpoint(e.target.value)} value={selectedCheckpoint || ''}>
          <option value="">Select...</option>
          {checkpoints.map(c => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {selectedCheckpoint && (
        <div>
          <label>Select Patrol:</label>
          <select onChange={(e) => setSelectedPatrol(e.target.value)} value={selectedPatrol || ''}>
            <option value="">Select...</option>
            {patrols.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {selectedPatrol && (
        <MapContainer
          center={[30.9980158371812, 75.9544962040041]}
          zoom={13}
          style={{ height: "600px", width: "100%" }}
          ref={mapRef}
          whenCreated={(mapInstance) => { mapRef.current = mapInstance; }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
        </MapContainer>
      )}
    </div>
  );
}

export default PatrolMap2;
