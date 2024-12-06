import React, { useEffect, useState } from 'react';

const Monitor = () => {
  const [videoSrc, setVideoSrc] = useState('');
  const [isStreaming, setIsStreaming] = useState(true); // State to control streaming

  useEffect(() => {
    if (isStreaming) {
      const videoFeedUrl = 'http://localhost:5000/video_feed'; // Flask video stream URL
      setVideoSrc(videoFeedUrl);
    } else {
      setVideoSrc(''); // Stop the stream
    }
  }, [isStreaming]);

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
    <div className="Monitor">
      <h1>Live Gender Detection Monitor</h1>
      {isStreaming ? (
        <img src={videoSrc} alt="Live Stream" style={{ width: '640px', height: '480px' }} />
      ) : (
        <p>Camera stopped.</p>
      )}
      <button onClick={handleStopCamera} style={{ marginTop: '20px', padding: '10px 20px' }}>
        Stop Camera
      </button>
    </div>
  );
};

export default Monitor;
