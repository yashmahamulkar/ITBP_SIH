import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../static/consumptionform.css'; // Import the CSS file

const ConsumptionLogForm = () => {
    const [checkposts, setCheckposts] = useState([]);
    const [personnel, setPersonnel] = useState([]);
    const [items, setItems] = useState([]);
    const [selectedCheckpost, setSelectedCheckpost] = useState('');
    const [selectedPersonnel, setSelectedPersonnel] = useState('');
    const [selectedItem, setSelectedItem] = useState('');
    const [quantity, setQuantity] = useState('');
    const [message, setMessage] = useState('');

    // Fetch checkposts from the API
    useEffect(() => {
        const fetchCheckposts = async () => {
            try {
                const response = await axios.get('/api/consumption/checkposts'); // Updated endpoint
                setCheckposts(response.data);
            } catch (error) {
                console.error('Error fetching checkposts:', error);
            }
        };
        fetchCheckposts();
    }, []);

    // Fetch personnel from the API
    useEffect(() => {
        const fetchPersonnel = async () => {
            try {
                const response = await axios.get('/api/consumption/personnel'); // Updated endpoint
                setPersonnel(response.data);
            } catch (error) {
                console.error('Error fetching personnel:', error);
            }
        };
        fetchPersonnel();
    }, []);

    // Fetch items based on selected checkpost
    useEffect(() => {
        const fetchItems = async () => {
            if (selectedCheckpost) {
                try {
                    const response = await axios.get(`/api/consumption/inventory?checkpost=${selectedCheckpost}`); // Updated endpoint
                    setItems(response.data);
                } catch (error) {
                    console.error('Error fetching items:', error);
                }
            } else {
                setItems([]);
            }
        };
        fetchItems();
    }, [selectedCheckpost]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('/api/consumption/log', { // Updated endpoint
                personnel_id: selectedPersonnel,
                checkpost_id: selectedCheckpost,
                item_id: selectedItem,
                quantity_consumed: quantity,
            });
            setMessage('Consumption logged successfully.');
            setSelectedCheckpost('');
            setSelectedPersonnel('');
            setSelectedItem('');
            setQuantity('');
        } catch (error) {
            console.error('Error logging consumption:', error);
            setMessage('Failed to log consumption. Please try again.');
        }
    };

    return (
        <div className="consumption-log-form-cl">
            <h2>Log Daily Consumption</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="checkpost">Select Checkpost:</label>
                    <select
                        id="checkpost"
                        value={selectedCheckpost}
                        onChange={(e) => setSelectedCheckpost(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a checkpost</option>
                        {checkposts.map((checkpost) => (
                            <option key={checkpost.id} value={checkpost.id}>
                                {checkpost.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="personnel"  style={{display: "none"}}>Select Personnel:</label>
                    <select
                        id="personnel"
                        value={selectedPersonnel}
                        onChange={(e) => setSelectedPersonnel(e.target.value)}
                        required
                        style={{display: "none"}}
                    >
                        <option value="" disabled>Select a personnel</option>
                        {personnel.map((person) => (
                            <option key={person.personnel_id} value={1}>
                                {person.first_name} {person.last_name} - {person.rank}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="item">Select Item:</label>
                    <select
                        id="item"
                        value={selectedItem}
                        onChange={(e) => setSelectedItem(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select an item</option>
                        {items.map((item) => (
                            <option key={item.item_id} value={item.item_id}>
                                {item.item_name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label htmlFor="quantity">Quantity Consumed:</label>
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        required
                        placeholder="Quantity"
                    />
                </div>
                <button type="submit">Log Consumption</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
};

export default ConsumptionLogForm;
