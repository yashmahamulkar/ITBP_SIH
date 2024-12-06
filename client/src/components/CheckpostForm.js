import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'leaflet/dist/leaflet.css';
import '../static/checkpost.css';
import markerIconPng from 'leaflet/dist/images/marker-icon.png';

// Fixing default icon issue with Leaflet in React
const customMarkerIcon = new L.Icon({
  iconUrl: markerIconPng,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Headquarters data (can also be fetched from the backend)
const headquarters = [
  { id: 1, name: 'North West Frontier' },
  { id: 2, name: 'North East Frontier' },
  { id: 3, name: 'Northern Frontier' },
  { id: 4, name: 'Eastern Frontier' },
  { id: 5, name: 'Central Frontier' },
  { id: 6, name: 'Ladakh Sector' },
  { id: 7, name: 'Srinagar Sector' },
  { id: 8, name: 'Delhi Sector' },
  { id: 9, name: 'Tezpur Sector' },
  { id: 10, name: 'Dibrugarh Sector' },
  { id: 11, name: 'Itanagar Sector' },
  { id: 12, name: 'Dehradun Sector' },
  { id: 13, name: 'Shimla Sector' },
  { id: 14, name: 'Bareilly Sector' },
  { id: 15, name: 'Lucknow Sector' },
  { id: 16, name: 'Gangtok Sector' },
  { id: 17, name: 'Bengaluru Sector' },
  { id: 18, name: 'Bhubaneswar Sector' }
];

const CheckpostForm = () => {
  const [address, setAddress] = useState('');
  const [checkpostname, setCheckpostname] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [markerPosition, setMarkerPosition] = useState(null);
  const [selectedHeadquarter, setSelectedHeadquarter] = useState(''); // For dropdown

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

    if (!latitude || !longitude || !selectedHeadquarter) {
      toast.error('Please encode the address, select a headquarter, and fill in all fields.');
      return;
    }

    axios.post('http://localhost:5000/api/checkpost', {
      latitude: latitude,
      longitude: longitude,
      checkpostname: checkpostname,
      headquarter_id: selectedHeadquarter // Corrected field name
    })
      .then((response) => {
        toast.success('Checkpost added successfully!');
        setAddress('');
        setLatitude('');
        setLongitude('');
        setMarkerPosition(null);
        setSelectedHeadquarter('');
      })
      .catch((error) => {
        toast.error('Error adding checkpost: ' + (error.response?.data?.message || 'Unknown error'));
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
    <div className="checkpostpage-container">
      <div className="checkpostpage-left">
        <form onSubmit={handleSubmit}>
      
         

          <div>
            <label htmlFor="latitude" style={{ display:"None" }}>Latitude:</label>
            <input
              type="text"
              id="latitude"
              value={latitude}
              readOnly

              style={{ display:"None" }}
            />
          </div>

    


          <div>
            <label htmlFor="longitude"  style={{ display:"None" }}>Longitude:</label>
            <input
              type="text"
              id="longitude"
              value={longitude}
              readOnly
              style={{ display:"None" }}
            />
          </div>

          <button type="submit">Submit</button>
        </form>
      </div>

      {/* Map Section */}
      <div className="checkpostpage-right">

      <div className='checkpostnameinput'>
            <label htmlFor="checkpostname" >Enter Checkpost Name:</label>
            <input
              type="text"
              id="checkpostname"
            
              value={checkpostname}
              onChange={(e) => setCheckpostname(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="headquarter">Select Controlling Headquarter :</label>
            <select
              id="headquarter"
              value={selectedHeadquarter}
              onChange={(e) => setSelectedHeadquarter(e.target.value)}
            >
              <option value="">Select a headquarter</option>
              {headquarters.map(hq => (
                <option key={hq.id} value={hq.id}>
                  {hq.name}
                </option>
              ))}
            </select>
          </div>

       
        
        {/* Search bar on top of the map */}
        <div className="map-search-bar">
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Search for an address..."
          />
          <button onClick={geocodeAddress}><i className="fa-solid fa-magnifying-glass"></i></button>
        </div>
        
        <MapContainer center={[19.0760, 72.8777]} zoom={13} className="checkpostpage-map">
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>

      
    </div>
  );
};

export default CheckpostForm;
