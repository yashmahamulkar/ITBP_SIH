import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import '../static/cctvpage.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';
import exchange from '../static/images/exchange.png';

// Fixing default icon issue with Leaflet in React
const customMarkerIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const CCTVForm = () => {
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);

  // Function to geocode address using Nominatim
  const geocodeAddress = () => {
    if (!address) {
      toast.error('Please enter an address.');
      return;
    }

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;

    axios.get(nominatimUrl)
      .then((response) => {
        if (response.data.length > 0) {
          const location = response.data[0];
          setLatitude(location.lat);
          setLongitude(location.lon);
          setMarkerPosition([location.lat, location.lon]);
          toast.success('Address found and marker updated on the map!');
        } else {
          toast.error('No results found for the entered address.');
        }
      })
      .catch((error) => {
        toast.error('Geocoding failed: ' + error.message);
      });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!latitude || !longitude) {
      toast.error('Please encode the address and fill in all fields.');
      return;
    }

    axios.post('http://localhost:5000/api/cctv', {
      latitude: latitude,
      longitude: longitude,
    })
      .then((response) => {
        toast.success('CCTV added successfully!');
        setAddress('');
        setLatitude('');
        setLongitude('');
        setMarkerPosition(null);
      })
      .catch((error) => {
        toast.error('CCTV added successfully!')
      });
  };

  // Component to handle location marker and map fly logic
  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setLatitude(lat);
        setLongitude(lng);
        setMarkerPosition([lat, lng]);
        toast.info(`Marker set to: ${lat}, ${lng}`);
      },
    });

    useEffect(() => {
      if (markerPosition) {
        map.flyTo(markerPosition, 13); // Fly to the new coordinates with zoom level 13
      }
    }, [markerPosition, map]);

    return markerPosition ? (
      <Marker position={markerPosition} icon={customMarkerIcon}>
        <Popup>
          Lat: {markerPosition[0]}, Lng: {markerPosition[1]}
        </Popup>
      </Marker>
    ) : null;
  };

  return (
    


    <div className="cctvpage-container">
      <div className="cctvpage-left">
        <form onSubmit={handleSubmit}>
         

          <div>
            <label htmlFor="latitude"></label>
            <input
              type="text"
              id="latitude"
              value={latitude}
              style={{display : 'none'}}
              readOnly
            />
          </div>

          <div>
            <label htmlFor="longitude"></label>
            <input
              type="text"
              id="longitude"
              value={longitude}
              readOnly
              style={{display : 'none'}}
            />
          </div>

 

          <button type="submit">Submit</button>
        </form>
      </div>
      


      {/* Map Section */}
      <div className="cctvpage-right">
        <span className="cctvpage-title">Enter CCTV address or use map marker to search</span>
        
        {/* Search bar on top of the map */}
        <div className="map-search-bar">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search for an address..."
          />
          <button onClick={geocodeAddress}><i class="fa-solid fa-magnifying-glass"></i></button>
        </div>
        
        <MapContainer center={[19.0760, 72.8777]} zoom={13} className="cctvpage-map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>

      <ToastContainer />
    </div>
  );
};

export default CCTVForm;
