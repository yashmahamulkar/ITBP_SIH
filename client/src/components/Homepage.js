import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Homepage() {
  const [data, setData] = useState({
    username: '',
    total_people: 0,
    male_count: 0,
    female_count: 0
  });

  useEffect(() => {
    // Fetch data from the Flask backend
    axios.get('/homepage')
      .then(response => {
        setData(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the data!', error);
      });
  }, []);

  return (
    <div>
      <h1>Welcome, {data.username}!</h1>
      <p>Total People: {data.total_people}</p>
      <p>Male Count: {data.male_count}</p>
      <p>Female Count: {data.female_count}</p>
    </div>
  );
}

export default Homepage;
