import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Label, Legend } from 'recharts';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css'; // Import Leaflet CSS
import '../static/dashboard3.css';
import activemarker from '../static/images/activecctvmarker3.png';
import inactivemarker from '../static/images/inactivecctvmarker3.png';

function Dashboard() {
  const [totalPeople, setTotalPeople] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [chartData, setChartData] = useState([]); // For chart data
  const [cctvData, setCctvData] = useState([]); // For CCTV data
  const [activeCameras, setActiveCameras] = useState(0); // For active cameras count
  const [inactiveCameras, setInactiveCameras] = useState(0); // For inactive cameras count

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
        setCctvData(cctvResponse.data); // Store CCTV data

        // Calculate the number of active and inactive cameras
        const activeCount = cctvResponse.data.filter(cctv => cctv.status === 'active').length;
        const inactiveCount = cctvResponse.data.filter(cctv => cctv.status !== 'active').length;

        setActiveCameras(activeCount);
        setInactiveCameras(inactiveCount);

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

  return (
    <div>
      <div className="right_top">
        <div className="top_1">
          <div className="card-heading">Active Users</div>
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
          <div className="card-heading">Active Cameras</div>
          <div className="card-content">
            <i className="fas fa-video card-icon"></i>
            <div className="card-value">{activeCameras}/{activeCameras + inactiveCameras}</div>
          </div>
        </div>
      </div>

      <div className="rightbottom">
        <div className="rightbottomleft">
          <MapContainer center={[19.0330, 73.0297]} zoom={12}>
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
                    <strong>Proxy Address:</strong> {cctv.proxyaddress}
                  </Popup>
                </Marker>
                {getCircle(cctv.latitude, cctv.longitude)}
              </React.Fragment>
            ))}
          </MapContainer>
        </div>

        <div className="rightbottomright">
          {/* Uncomment this section to add chart back */}
          {/* <div className="rightbottom_chart">
            <div className="chartheading">SOS Alerts</div>
            <ResponsiveContainer>
              <AreaChart data={chartData}>
                <XAxis dataKey="date">
                  <Label value="Date" offset={0} position="insideBottom" />
                </XAxis>
                <YAxis>
                  <Label value="Count" angle={-90} position="insideLeft" />
                </YAxis>
                <Tooltip />
                <Legend layout="vertical" align="right" verticalAlign="top" />
                <Area
                  type="monotone"
                  dataKey="male_count"
                  stroke="#36A2EB"
                  fill="#36A2EB"
                  fillOpacity={0.3}
                  name="Male Count"
                />
                <Area
                  type="monotone"
                  dataKey="female_count"
                  stroke="#FF6384"
                  fill="#FF6384"
                  fillOpacity={0.3}
                  name="Female Count"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div> */}
          
          <div className="rightbottom_warning">
            <div className="warnings_top">
              <i className="fa-regular fa-bell"></i>
              <span className="warning_heading">Alerts</span>
            </div>
            <div className="warning_content">
              <div className="warningspoints">
                SOS Alert from Priya , Location: Panvel
              </div>
              <div className="warningspoints">
                SOS Alert from Arya , Location: Seawoods
              </div>
              <div className="warningspoints">
                SOS Alert from Nikita , Location: Kharghar
              </div>
              <div className="warningspoints">
                SOS Alert from Shraddha , Location: Badalapur
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
