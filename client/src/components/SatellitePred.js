import React, { useState } from 'react';
import axios from 'axios';

function SatellitePred() {
    const [file, setFile] = useState(null);
    const [prediction, setPrediction] = useState('');

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        
        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/predict', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            setPrediction(response.data.prediction);
        } catch (error) {
            console.error('Error uploading the file:', error);
        }
    };

    return (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
            <h1>Damage Predictor</h1>
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <button onClick={handleUpload}>Upload and Predict</button>
            {prediction && <h2>Prediction: {prediction}</h2>}
        </div>
    );
}

export default SatellitePred;
