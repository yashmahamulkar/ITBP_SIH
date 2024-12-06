import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import policestationmarker from '../static/images/policestationmarker.png';
import activemarker from '../static/images/activecctvmarker3.png';
import inactivemarker from '../static/images/inactivecctvmarker3.png';
import checkpostmarker from '../static/images/police-station.png';
import headquartersmarker from '../static/images/police-station.png';
import "../static/mapscomponent.css";
import CheckpostHierarchy from './CheckpostHierarchy';

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

function filterDataByBounds(data, bounds) {
  return data.filter(element => {
    const { latitude, longitude } = element;
    if (latitude === undefined || longitude === undefined) {
      return false;
    }
    const point = L.latLng(latitude, longitude);
    return bounds.contains(point);
  });
}

function clusterMarkers(data, threshold = 0.005) {
  const clustered = [];
  data.forEach((element) => {
    const { latitude, longitude, name } = element;
    if (!latitude || !longitude) return;

    let addedToCluster = false;
    for (let cluster of clustered) {
      const clusterCenter = cluster.center;
      const distance = Math.sqrt(
        Math.pow(latitude - clusterCenter.lat, 2) + Math.pow(longitude - clusterCenter.lon, 2)
      );

      if (distance < threshold) {
        cluster.points.push(element);
        cluster.center.lat = (cluster.center.lat + latitude) / 2;
        cluster.center.lon = (cluster.center.lon + longitude) / 2;
        cluster.name = cluster.points[0].name || '';
        addedToCluster = true;
        break;
      }
    }

    if (!addedToCluster) {
      clustered.push({
        center: { lat: latitude, lon: longitude },
        points: [element],
        name: name || '',
      });
    }
  });

  return clustered;
}

function CombinedMap() {
  const [data, setData] = useState([]);
  const [cctvData, setCctvData] = useState([]);
  const [checkpostData, setCheckpostData] = useState([]);
  const [headquartersData, setHeadquartersData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bounds, setBounds] = useState(null);
  const [mapType, setMapType] = useState('cctv');
  const [selectedCheckpostId, setSelectedCheckpostId] = useState(null); // State for selected checkpost ID

  useEffect(() => {
    const fetchCctvData = async () => {
      try {
        const response = await axios.get('/cctvdata');
        setCctvData(response.data);
      } catch (error) {
        console.error('Error fetching CCTV data:', error);
      }
    };

    const fetchCheckpostData = async () => {
      try {
        const response = await axios.get('/api/checkposts'); // Fetching from the Flask API
        console.log('Checkpost data fetched:', response.data); // Log fetched data
        setCheckpostData(response.data);
      } catch (error) {
        console.error('Error fetching checkpost data:', error);
      }
    };

    const fetchHeadquartersData = async () => {
      try {
        const response = await axios.get('/api/headquarters'); // Fetching from the Flask API
        setHeadquartersData(response.data);
      } catch (error) {
        console.error('Error fetching headquarters data:', error);
      }
    };

    fetchCctvData();
    fetchCheckpostData();
    fetchHeadquartersData();
    setLoading(false);
  }, []);

  const handleBoundsChange = (newBounds) => {
    setBounds(newBounds);
  };

  const filteredData = bounds ? filterDataByBounds(data, bounds) : [];
  const clusteredData = clusterMarkers(filteredData);

  const getMarkerIcon = (status) => {
    return L.icon({
      iconUrl: status === 'active' ? activemarker : inactivemarker,
      iconSize: [27, 27],
      iconAnchor: [13, 27],
      popupAnchor: [0, -27],
    });
  };

  const handleMarkerClick = (checkpost) => {
    console.log("Checkpost selected:", checkpost); // Log the entire checkpost object
    if (checkpost && checkpost.id) {
      setSelectedCheckpostId(checkpost.id);  // Set selected checkpost ID
    } else {
      console.warn("No ID found for checkpost:", checkpost);
    }
  };

  return (
    <div className="mapsMainContainer">
      <div className="CombinedMap">
        <div className="map-top">
          <div className="map-selector">
            <select onChange={(e) => setMapType(e.target.value)} value={mapType}>
              <option value="cctv">CCTV Map</option>
              <option value="police">Police Station Map</option>
              <option value="checkpost">Checkpost Map</option>
              <option value="headquarters">Headquarters Map</option>
              <option value="both">Both</option>
            </select>
          </div>
        </div>

        <MapContainer
          center={[19.0760, 72.8777]} // Mumbai coordinates
          zoom={12}
          style={{ height: '85vh', width: '60vw' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <MapEvents onBoundsChange={handleBoundsChange} />

          {mapType === 'police' || mapType === 'both' ? (
            clusteredData.map((cluster, index) => {
              const { lat, lon } = cluster.center;
              const stationName = cluster.name;

              return (
                <Marker
                  key={`police-${index}`}
                  position={[lat, lon]}
                  icon={L.icon({
                    iconUrl: policestationmarker,
                    iconSize: [25, 25],
                    iconAnchor: [16, 32],
                    popupAnchor: [0, -32]
                  })}
                >
                  <Popup>
                    <strong>Police Station:</strong><br />
                    {stationName}
                  </Popup>
                </Marker>
              );
            })
          ) : null}

          {mapType === 'cctv' || mapType === 'both' ? (
            cctvData.map((cctv) => (
              <React.Fragment key={`cctv-${cctv.cctvid}`}>
                <Marker
                  position={[cctv.latitude, cctv.longitude]}
                  icon={getMarkerIcon(cctv.status)}
                >
                  <Popup>
                    <strong>CCTV ID:</strong> {cctv.cctvid} <br />
                    <strong>Status:</strong> {cctv.status} <br />
                  </Popup>
                </Marker>
                <Circle
                  center={[cctv.latitude, cctv.longitude]}
                  radius={20}
                  color="blue"
                  fillColor="blue"
                  fillOpacity={0.2}
                />
              </React.Fragment>
            ))
          ) : null}

          {mapType === 'checkpost' || mapType === 'both' ? (
            checkpostData.map((checkpost) => {
              console.log('Rendering checkpost:', checkpost); // Log each checkpost object
              return (
                <Marker
                  key={checkpost.id || checkpost.name}  // Use fallback in case ID is missing
                  position={[checkpost.latitude, checkpost.longitude]}
                  icon={L.icon({
                    iconUrl: checkpostmarker,
                    iconSize: [25, 25],
                    iconAnchor: [12, 24],
                    popupAnchor: [0, -24]
                  })}
                  eventHandlers={{
                    click: () => handleMarkerClick(checkpost),  // Pass full object to handler
                  }}
                >
                  <Popup>
                    <strong>{checkpost.name}</strong><br />
                   
                  </Popup>
                </Marker>
              );
            })
          ) : null}

          {mapType === 'headquarters' || mapType === 'both' ? (
            headquartersData.map((hq) => (
              <Marker
                key={hq.id}
                position={[hq.latitude, hq.longitude]}
                icon={L.icon({
                  iconUrl: headquartersmarker,
                  iconSize: [25, 25],
                  iconAnchor: [12, 24],
                  popupAnchor: [0, -24]
                })}
              >
                <Popup>
                  <strong>Headquarter:</strong><br />
                  {hq.name}<br />
                  {hq.address}
                </Popup>
              </Marker>
            ))
          ) : null}
        </MapContainer>
      </div>

      {/* Render the CheckpostHierarchy component if a checkpost is selected */}
      {selectedCheckpostId && (
        <CheckpostHierarchy selectedCheckpostId={selectedCheckpostId} />
      )}
    </div>
  );
}

export default CombinedMap;
