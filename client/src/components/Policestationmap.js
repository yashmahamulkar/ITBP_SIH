import React, { useEffect, useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import policestationmarker from '../static/images/policestationmarker.png'

// Component to track map bounds and trigger events
function MapEvents({ onBoundsChange }) {
  useMapEvents({
    moveend() {
      const map = this;
      const bounds = map.getBounds();
      onBoundsChange(bounds);
    },
  });
  return null;
}

// Function to filter data by bounds
function filterDataByBounds(data, bounds) {
  return data.filter(element => {
    const { lat, lon } = element;
    if (lat === undefined || lon === undefined) {
      return false;
    }
    const point = L.latLng(lat, lon);
    return bounds.contains(point);
  });
}

// Utility function to cluster markers by proximity
function clusterMarkers(data, threshold = 0.005) {
  const clustered = [];

  data.forEach((element) => {
    const { lat, lon, tags } = element;
    if (!lat || !lon) return;

    let addedToCluster = false;

    for (let cluster of clustered) {
      const clusterCenter = cluster.center;
      const distance = Math.sqrt(
        Math.pow(lat - clusterCenter.lat, 2) + Math.pow(lon - clusterCenter.lon, 2)
      );

      if (distance < threshold) {
        // Add to the existing cluster
        cluster.points.push(element);
        cluster.center.lat = (cluster.center.lat + lat) / 2;
        cluster.center.lon = (cluster.center.lon + lon) / 2;
        // Set the cluster's name to the name of the first marker
        cluster.name = cluster.points[0].tags?.name || '';
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      // Create a new cluster with the name of the first marker
      clustered.push({
        center: { lat, lon },
        points: [element],
        name: tags?.name || '',
      });
    }
  });

  return clustered;
}

// Function to create a custom icon
function createCustomIcon() {
  return L.icon({
    iconUrl: policestationmarker,
    iconSize: [25, 25], // Size of the icon [width, height]
    iconAnchor: [16, 32], // Anchor point of the icon (relative to its top-left corner)
    popupAnchor: [0, -32] // Anchor point of the popup (relative to the iconAnchor)
  });
}

function PoliceStationsMap() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bounds, setBounds] = useState(null);

  useEffect(() => {
    fetch('/static/policestation.json') // Ensure the path is correct
      .then(response => response.json())
      .then(data => {
        console.log('Fetched data:', data); // Debugging
        setData(data.elements || []);
      })
      .catch(error => console.error('Error fetching data:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleBoundsChange = useCallback((newBounds) => {
    setBounds(newBounds);
  }, []);

  const filteredData = bounds ? filterDataByBounds(data, bounds) : [];

  // Cluster markers by proximity
  const clusteredData = clusterMarkers(filteredData);

  return (
    <MapContainer
      center={[19.0760, 72.8777]} // Mumbai coordinates
      zoom={12}
      style={{ height: '100vh', width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <MapEvents onBoundsChange={handleBoundsChange} />

      {clusteredData.map((cluster, index) => {
        const { lat, lon } = cluster.center;
        const stationName = cluster.name; // Use the representative name for the cluster

        return (
          <Marker
            key={index}
            position={[lat, lon]}
            icon={createCustomIcon()} // Use custom icon
          >
            <Popup>
              <strong>Police Station:</strong><br />
              {stationName}
            </Popup>
          </Marker>
        );
      })}

      {loading && <div>Loading...</div>}
    </MapContainer>
  );
}

export default PoliceStationsMap;
