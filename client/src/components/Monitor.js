import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../static/monitor.css'; // Import the CSS file
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Label, Legend } from 'recharts';
// Import the camroom image

const Monitor = () => {
  const [videoSrc, setVideoSrc] = useState('');
  const [isStreaming, setIsStreaming] = useState(true); // State to control streaming
  const [maleCount, setMaleCount] = useState(0); // State for male count
  const [femaleCount, setFemaleCount] = useState(0); // State for female count
  const [chartData, setChartData] = useState([]); // State for chart data

  useEffect(() => {
    if (isStreaming) {
      const videoFeedUrl = 'http://localhost:5000/video_feed'; // Flask video stream URL
      setVideoSrc(videoFeedUrl);
    } else {
      setVideoSrc(''); // Stop the stream
    }
  }, [isStreaming]);

  // Fetch chart data
  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const chartResponse = await axios.get('/chartdata');
        
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

      } catch (error) {
        console.error('Error fetching chart data:', error);
      }
    };

    fetchChartData();
  }, []);

  // Function to stop the video stream on both frontend and backend
  const handleStopCamera = () => {
    fetch('http://localhost:5000/stop_feed', {
      method: 'POST', // Send POST request to backend to stop feed
    })
      .then((response) => response.json())
      .then((data) => {
        console.log(data.status); // Log the backend response (e.g., "Camera stopped")
        setIsStreaming(false);    // Stop displaying the video on frontend
      })
      .catch((error) => console.error('Error:', error));
  };

  return (
    <div className="monitor-container">
      <div className="video-container">
        <div className="video-containerbackground"></div>
      
          <img src={videoSrc} alt="Camera is Connecting. Please Wait . . ." style={{ width: '640px', height: '480px' }}  />
        
          
      </div>
      
      <div className="info-container">
        <div className="camdetails">
          <h2><center>CCTV Details</center></h2>
          <p>Camera Number : 15</p>
          <p>Street : Seawoods Grand Central Mall Road</p>
          <p>City: Navi Mumbai</p>
          <p>State : Maharashtra</p>
        </div>
        
     
        <button onClick={handleStopCamera} className="stop-button">
          Stop Camera
        </button>
      </div>
 
    </div>
  );
};

export default Monitor;
