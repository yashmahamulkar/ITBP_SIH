import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import Chart from 'chart.js/auto';
import 'chartjs-adapter-moment';
import '../static/dashboard.css'; 

function Dashboard() {
  const [totalPeople, setTotalPeople] = useState(0);
  const [maleCount, setMaleCount] = useState(0);
  const [femaleCount, setFemaleCount] = useState(0);
  const [chartData, setChartData] = useState({
    timestamps: [],
    male_count: [],
    female_count: []
  });
  const [sosAlert, setSosAlert] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const homepageResponse = await axios.get('/homepagedata');
        console.log(homepageResponse);
        const chartResponse = await axios.get('/chartdata');
        
        setTotalPeople(homepageResponse.data.total_people);
        setMaleCount(homepageResponse.data.male_count);
        setFemaleCount(homepageResponse.data.female_count);
        setChartData(chartResponse.data);
        
        renderChart(chartResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();

    /*const socket = io();
    socket.on('update_content', (data) => {
      console.log('Received SOS alert:', data);
      setSosAlert(data.data);
    });

    return () => {
      socket.disconnect();
    };*/
  }, []);

  const renderChart = useCallback((data) => {
    const ctx = document.getElementById('myChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.timestamps,
        datasets: [
          {
            label: 'Male Count',
            data: data.male_count,
            borderColor: 'rgba(54, 162, 235, 1)',
            backgroundColor: 'rgba(54, 162, 235, 0.2)',
            fill: true,
          },
          {
            label: 'Female Count',
            data: data.female_count,
            borderColor: 'rgba(255, 99, 132, 1)',
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            fill: true,
          }
        ]
      },
      options: {
        scales: {
          x: {
            type: 'time',
            time: {
              unit: 'minute',
              stepSize: 30,
              displayFormats: { minute: 'HH:mm' },
            },
            title: { display: true, text: 'Time' },
          },
          y: { title: { display: true, text: 'Count' } },
        },
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: 'Time vs Count' },
        }
      }
    });
  }, []);

  return (
    <div>

          <div className="right_top">
            <div className="top_1">
             Total People Detected
              {totalPeople}
            </div>
            <div className="top_2">
              <h2>Total Male Detected</h2>
              <h1>{maleCount}</h1>
            </div>
            <div className="top_3">
              <h2>Total Female Detected</h2>
              <h1>{femaleCount}</h1>
            </div>
          </div>
          <div className="right_middle">
            <div className="middle_1">
              <iframe
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
                src="https://www.openstreetmap.org/export/embed.html?bbox=73.126837%2C18.988549%2C73.129837%2C18.991549&layer=mapnik&marker=18.990049%2C73.128337"
                style={{ borderRadius: '10px' }}
              ></iframe>
              <small>
                <a href="https://www.openstreetmap.org/?mlat=19.0760&mlon=72.8777#map=15/19.0760/72.8777">
                  View Larger Map
                </a>
              </small>
            </div>
            <div className="middle_2">
              <canvas id="myChart" width="400" height="100"></canvas>
            </div>
          </div>
   
        </div>
 
    
  );
}

export default Dashboard;
