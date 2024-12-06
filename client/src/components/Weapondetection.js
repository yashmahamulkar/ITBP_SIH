import React, { useState } from 'react';
import axios from 'axios';

const WeaponDetection = () => {
    const [image, setImage] = useState(null);
    const [predictions, setPredictions] = useState([]);

    const handleImageChange = (e) => {
        setImage(e.target.files[0]);
    };

    const handleUpload = () => {
        const formData = new FormData();
        formData.append('image', image);

        axios.post('http://localhost:5000/predict', formData)
            .then(response => {
                setPredictions(response.data);
            })
            .catch(error => {
                console.error('Error uploading image:', error);
            });
    };

    const drawBoundingBoxes = () => {
        const canvas = document.getElementById('imageCanvas');
        const ctx = canvas.getContext('2d');
        const img = document.getElementById('uploadedImage');

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx.drawImage(img, 0, 0);

            predictions.forEach(pred => {
                const { box, label, score } = pred;
                const [x1, y1, x2, y2] = box;  // xyxy format

                // Draw bounding box
                ctx.strokeStyle = 'red';
                ctx.lineWidth = 2;
                ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);

                // Label with class and score
                ctx.font = '16px Arial';
                ctx.fillStyle = 'red';
                ctx.fillText(`${label} (${Math.round(score * 100)}%)`, x1, y1 - 5);
            });
        };
    };

    return (
        <div>


        <select
        id="detectionDropdown"
    
      >
        <option value="">-- Select an option --</option>
        <option value="weapon">Weapon Detection</option>
        <option value="disaster">Disaster Detection</option>
        <option value="fight">Fight Detection</option>
      </select>
            <input type="file"  onChange={handleImageChange} />
            <button onClick={handleUpload}>Upload & Detect</button>

            {image && <img id="uploadedImage" src={URL.createObjectURL(image)} alt="uploaded" style={{ display: 'none' }} />}
            <canvas id="imageCanvas" style={{ border: '1px solid black' }}></canvas>

            {predictions.length > 0 && drawBoundingBoxes()}
        
            <div><h1>Prediction : Damaged Area</h1></div>
        </div>


    );
};

export default WeaponDetection;
