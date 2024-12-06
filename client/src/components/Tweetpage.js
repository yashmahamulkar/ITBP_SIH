import React, { useState } from 'react';
import axios from 'axios';
import "../static/tweetpage.css";
import twitterlogo from "../static/images/x.jpeg";
import telegram from "../static/images/telegram.png";
import facebook from "../static/images/facebook.png";
import instagram from "../static/images/instagram.webp";

function TweetComponent() {
  const [tweet, setTweet] = useState('');
  const [threatLevel, setThreatLevel] = useState('');
  const [error, setError] = useState('');

  const handleTweetChange = (e) => {
    setTweet(e.target.value);
  };

  const classifyTweet = async () => {
    try {
      const response = await axios.post('/classify_tweet', { tweet });
      setThreatLevel(response.data.threat_level);
      setError('');
    } catch (err) {
      setError('Error classifying tweet. Please try again.');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    classifyTweet();
  };

  return (
    <div>
      <div className="tweetcontainer">
        <div className="tweetheading">Threat Text Detection Tool</div>
        <form className="tweetform" onSubmit={handleSubmit}>
          <textarea
            className="tweettext" 
            placeholder="Enter a Text Message"
            value={tweet}
            onChange={handleTweetChange}
            rows="6"
            cols="80"
      
          />
          <br />
          <button id ="tweetformbutton" type="submit">Detect</button>
        </form>

        {threatLevel && (
          <div className={`threat-level ${threatLevel === 'Non-threatening' ? 'green' : 'red'}`}>
            <h3>{threatLevel}</h3>
          </div>
        )}

        {error && <p style={{ color: 'red' }}>{error}</p>}

        <div className="social-logos">
    <div className="social-logo-item">
        <img src={twitterlogo} alt="Twitter" className="social-logo" />
        <p>X</p>
    </div>
    
    <div className="social-logo-item">
        <img src={telegram} alt="Telegram" className="social-logo" />
        <p>Telegram</p>
    </div>
    
    <div className="social-logo-item">
        <img src={facebook} alt="Facebook" className="social-logo" />
        <p>Facebook</p>
    </div>
    
    <div className="social-logo-item">
        <img src={instagram} alt="Instagram" className="social-logo" />
        <p>Instagram</p>
    </div>
</div>



      </div>

     
    </div>
  );
}

export default TweetComponent;
