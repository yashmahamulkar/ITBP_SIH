import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import '../static/headquarterdashboard.css'; // External CSS file for styling
import PendingOrders from './PendingOrders'; // Import the PendingOrders component
import PendingOrdersTable from './Pendingordertable';
import ApprovedOrdersTable from './ApprovedOrderTable';
// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AddInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [newItem, setNewItem] = useState({
        item_name: '',
        category: '',
        quantity: 0,
        unit: '',
        image: null,
        existingItemId: null
    });
    const [mode, setMode] = useState('add'); // To switch between adding and increasing stock
    const [categories, setCategories] = useState(['Food', 'weapon', 'firearms']); // Predefined categories
    const [selectedCategory, setSelectedCategory] = useState(''); // Store selected category
    const [filteredItems, setFilteredItems] = useState([]); // Items filtered by category
    const [showOrders, setShowOrders] = useState(''); // State to toggle between orders

    useEffect(() => {
        fetchInventory();
    }, []);

    const fetchInventory = async () => {
        const response = await axios.get('/api/inventory');
        const inventoryData = response.data;
        setInventory(inventoryData);
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        if (name === 'image') {
            setNewItem({ ...newItem, image: e.target.files[0] });
        } else {
            setNewItem({
                ...newItem,
                [name]: type === 'checkbox' ? e.target.checked : value
            });
        }
    };

    const handleAddItem = async () => {
        const formData = new FormData();
        Object.entries(newItem).forEach(([key, value]) => {
            formData.append(key, value);
        });

        try {
            if (mode === 'add') {
                // Adding new item
                await axios.post('/api/inventory', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });
            } else {
                // Increasing stock for an existing item
                if (!newItem.existingItemId) {
                    console.error(
                        'No existing item selected for increasing stock.'
                    );
                    return;
                }

                await axios.put(
                    `/api/increaseinventory/${newItem.existingItemId}`,
                    {
                        quantity: newItem.quantity // Send the new quantity to increase
                    }
                );
            }
            fetchInventory(); // Refresh inventory list after adding or updating
            setNewItem({
                item_name: '',
                category: '',
                quantity: 0,
                unit: '',
                image: null,
                existingItemId: null
            });
        } catch (error) {
            console.error(
                'There was an error adding or updating the item!',
                error
            );
        }
    };

    const handleModeChange = (newMode) => {
        setMode(newMode);
        setNewItem({
            item_name: '',
            category: '',
            quantity: 0,
            unit: '',
            image: null,
            existingItemId: null
        });
    };

    const handleCategoryChange = (e) => {
        const selected = e.target.value;
        setSelectedCategory(selected);
        const filtered = inventory.filter((item) => item.category === selected);
        setFilteredItems(filtered);
    };

    // Prepare data for the bar chart
    const barChartData = {
        labels: filteredItems.map(item => item.item_name), // X-axis labels
        datasets: [
            {
                label: 'Quantity',
                data: filteredItems.map(item => item.quantity), // Y-axis data
                backgroundColor: 'rgba(75, 192, 192, 0.6)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1,
            }
        ]
    };

    return (
        <div className="dashboard-container">
           <div className="items-section">
    <h4>All Inventory Items</h4>
   
    <div className="items-grid">
        {inventory.map((item) => (
            <div key={item.item_id} className="item-card">
                {/* Use the URL route to fetch the image */}
                {item.image_path && (
                    <img
                        src={`${item.image_path}`} // Adjust the path to match your server route
                        alt={item.item_name}
                    />
                )}
                <h5>{item.item_name}</h5>
                <p>Quantity: {item.quantity} {item.unit}</p>
                <p>Category: {item.category}</p>
           
            </div>
        ))}
    </div>
</div>


            <div className="items-mid">
                <div className="chart-section">
                    <div className="chart-section-top">
                        <h5>Item-wise Quantity for Category: {selectedCategory}</h5>
                        <select id="selectcat" value={selectedCategory} onChange={handleCategoryChange}>
                            <option value="">Select a category</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>
                    {filteredItems.length > 0 && (
                        <div className="chart-wrapper">
                            <Bar data={barChartData} />
                        </div>
                    )}
                </div>

     
        <div className="form-section">
            <div className="form-toggle">
                <button onClick={() => handleModeChange('add')}>Add New Item</button>
                <button onClick={() => handleModeChange('increase')}>Increase Stock</button>
                <button onClick={() => handleModeChange('pending')}>Pending Orders</button>
                <button onClick={() => handleModeChange('approved')}>Approved Orders</button>
            </div>

            {mode === 'add' && (
                <>
                    <h4>Register New Item</h4>
                    <div className="form">
                        <div className="form-group">
                            <label>Item Name</label>
                            <input
                                type="text"
                                name="item_name"
                                placeholder="Item Name"
                                value={newItem.item_name}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Category</label>
                            <select
                                name="category"
                                value={newItem.category}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Select Category</option>
                                {categories.map((category) => (
                                    <option key={category} value={category}>
                                        {category.charAt(0).toUpperCase() + category.slice(1)}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantity</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Quantity"
                                value={newItem.quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Unit</label>
                            <input
                                type="text"
                                name="unit"
                                placeholder="Unit"
                                value={newItem.unit}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label>Image</label>
                            <input
                                type="file"
                                name="image"
                                accept="image/*"
                                onChange={handleInputChange}
                            />
                        </div>

                        <button onClick={handleAddItem}>Add Item</button>
                    </div>
                </>
            )}

            {mode === 'increase' && (
                <>
                    <h4>Increase Stock</h4>
                    <div className="form">
                        <div className="form-group">
                            <label>Select Existing Item</label>
                            <select
                                name="existingItemId"
                                value={newItem.existingItemId || ''}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="" disabled>Select an existing item</option>
                                {inventory.map(item => (
                                    <option key={item.item_id} value={item.item_id}>
                                        {item.item_name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Quantity to Increase</label>
                            <input
                                type="number"
                                name="quantity"
                                placeholder="Quantity to Increase"
                                value={newItem.quantity}
                                onChange={handleInputChange}
                                required
                            />
                        </div>

                        <button onClick={handleAddItem}>Increase Stock</button>
                    </div>
                </>
            )}

            {mode === 'pending' && (
                <>
                    <div className='ao'>
                    <PendingOrdersTable /></div>
                </>
            )}

            {mode === 'approved' && (
                <>
                    <h4>Approved Orders</h4>
                    <ApprovedOrdersTable />
                </>
            )}
        </div>
  
            </div>
        </div>
    );
};

export default AddInventory;
