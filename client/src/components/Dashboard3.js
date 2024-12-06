import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import '../static/dashboard4.css'; 
import activemarker from '../static/images/activecctvmarker3.png';
import inactivemarker from '../static/images/inactivecctvmarker3.png';
import cctvalertlogo from '../static/images/cctvalert2.png';
import sosalertlogo from '../static/images/sosphone.png';

// Import weather SVGs
import clearSky from '../static/images/clear-day.svg';
import rain from '../static/images/rain.svg';
import snow from '../static/images/snow.svg';
import cloudy from '../static/images/cloudy.svg';
import thunderstorm from '../static/images/smoke.svg';
// Add more weather SVGs as needed

function Dashboard3() {
  const [totalPeople, setTotalPeople] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [chartData, setChartData] = useState([]); // For chart data
  const [cctvData, setCctvData] = useState([]); // For CCTV data
  const [activeCameras, setActiveCameras] = useState(0); // Active cameras count
  const [inactiveCameras, setInactiveCameras] = useState(0); // Inactive cameras count
  const [weatherData, setWeatherData] = useState([]); // For weather data

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homepageResponse = await axios.get('/homepagedata');
        const chartResponse = await axios.get('/chartdata');
        const cctvResponse = await axios.get('/cctvdata'); // Get CCTV data

        setTotalPeople(homepageResponse.data.total_people);
        setMaleCount(homepageResponse.data.male_count);
        setFemaleCount(homepageResponse.data.female_count);

        // Transform chart data to aggregate by day
        const transformedData = chartResponse.data.timestamps.reduce((acc, timestamp, index) => {
          const date = new Date(timestamp).toLocaleDateString(); // Convert timestamp to date string
          if (!acc[date]) {
            acc[date] = { male_count: 0, female_count: 0 };
          }
          acc[date].male_count += chartResponse.data.male_count[index];
          acc[date].female_count += chartResponse.data.female_count[index];
          return acc;
        }, {});

        const sortedDates = Object.keys(transformedData).sort();
        const formattedChartData = sortedDates.map(date => ({
          date: date,
          male_count: transformedData[date].male_count,
          female_count: transformedData[date].female_count
        }));

        setChartData(formattedChartData);

        const activeCount = cctvResponse.data.filter(cctv => cctv.status === 'active').length;
        const inactiveCount = cctvResponse.data.length - activeCount;

        setActiveCameras(activeCount);
        setInactiveCameras(inactiveCount);
        setCctvData(cctvResponse.data); // Store CCTV data

        // Fetch weather data for different states
        const weatherResponses = await Promise.all([
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Jammu,Kashmir,IN&appid=61d39bf996515480a20f8ef10b43be2a`),
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Shimla,IN&appid=66d8a6c7070c8aec50f7d443dcfae364`),
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Dehradun,IN&appid=66d8a6c7070c8aec50f7d443dcfae364`),
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Gangtok,IN&appid=66d8a6c7070c8aec50f7d443dcfae364`),
          axios.get(`https://api.openweathermap.org/data/2.5/weather?q=Itanagar,IN&appid=66d8a6c7070c8aec50f7d443dcfae364`)
        ]);

        const weatherData = weatherResponses.map(response => response.data);
        setWeatherData(weatherData);

      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  // Custom marker icon based on CCTV status
  const getMarkerIcon = (status) => {
    return L.icon({
      iconUrl: status === 'active' ? activemarker : inactivemarker,
      iconSize: [27, 27], // Adjust size here
      iconAnchor: [10, 34],
      popupAnchor: [1, -34],
    });
  };

  // Function to create circular region around marker
  const getCircle = (lat, lng) => {
    return (
      <Circle
        center={[lat, lng]}
        radius={20} // Radius in meters
        color="blue"
        fillColor="blue"
        fillOpacity={0.2}
      />
    );
  };

  // Function to get appropriate weather icon based on condition
  const getWeatherIcon = (weatherCondition) => {
    switch (weatherCondition) {
      case 'Clear':
        return clearSky;
      case 'Rain':
        return rain;
      case 'Snow':
        return snow;
      case 'Clouds':
        return cloudy;
      case 'Thunderstorm':
        return thunderstorm;
      default:
        return clearSky; // Default to clear sky if no condition matches
    }
  };

  return (
    <div>
      <div className="right_top">
        <div className="top_1">
          <div className="card-heading">On Duty Officers</div>
          <div className="card-content">
            <i className="fas fa-users card-icon"></i>
            <div className="card-value">{totalPeople}</div>
          </div>
        </div>
        <div className="top_2">
          <div className="card-heading">Total Alerts</div>
          <div className="card-content">
            <i className="fas fa-bell card-icon"></i>
            <div className="card-value">801</div>
          </div>
        </div>
        <div className="top_3">
          <div className="card-heading">Total Locations Monitored</div>
          <div className="card-content">
            <i className="fas fa-video card-icon"></i>
            <div className="card-value">{activeCameras}/{activeCameras + inactiveCameras}</div>
          </div>
        </div>
      </div>

      <div className="rightbottom">
        <div className="rightbottomleft">
          <div className="rightbottom-map">
            <MapContainer center={[32.0268, 77.3511]} zoom={8} >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {cctvData.map((cctv) => (
                <React.Fragment key={cctv.cctvid}>
                  <Marker
                    position={[cctv.latitude, cctv.longitude]}
                    icon={getMarkerIcon(cctv.status)}
                  >
                    <Popup>
                      <strong>CCTV ID:</strong> {cctv.cctvid} <br />
                      <strong>Status:</strong> {cctv.status} <br />
                    </Popup>
                  </Marker>
                  {getCircle(cctv.latitude, cctv.longitude)}
                </React.Fragment>
              ))}
            </MapContainer>
          </div>
        </div>

        <div className="rightbottomright">
          <div className="rightbottom_warning">
            <div className="warnings_top">
              <img src={cctvalertlogo} alt="cctvalert" className="cctvalertlogo" />
              <span className="warning_heading">Surveillance Alerts</span>
            </div>
            <div className="warning_content" style={{ overflowY: 'auto', height: 'calc(100% - 40px)' }}>
              <div className="alert_list">
                <p>17 Sept 2024 16:38 : Unusual Activity detected (CCTV No: 17).</p>
                <p>17 Sept 2024 20:21 : Fight Detected (CCTV No: 18).</p>
                <p>28 Sept 2024 14:21 : Border Crossing Detected (CCTV No: 154).</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="weather_container">
        {weatherData.map((data, index) => (
          <div className="weather_card" key={index}>
            <img src={getWeatherIcon(data.weather[0].main)} alt={data.weather[0].description} className="weather_img" />
            <div className="weather_info">
              <h4>{data.name}</h4>
              <p>{Math.round(data.main.temp - 273.15)}°C</p>
              <p>{data.weather[0].description}</p>
            </div>
          </div>
        ))}
      </div>

   
    </div>
  );
}

export default Dashboard3;
