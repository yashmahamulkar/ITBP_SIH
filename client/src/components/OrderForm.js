import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../static/order.css';

const OrderForm = ({ checkpostId }) => {
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [items, setItems] = useState([]);
    const [selectedItems, setSelectedItems] = useState({});
    const [message, setMessage] = useState('');

    // Fetch categories from the API
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get('/api/categories'); // Ensure this endpoint exists
                setCategories(response.data);
            } catch (error) {
                console.error('Error fetching categories:', error);
            }
        };
        fetchCategories();
    }, []);

    // Fetch inventory items based on the selected category
    useEffect(() => {
        const fetchItems = async () => {
            if (selectedCategory) {
                try {
                    const response = await axios.get(`/api/inventory?category=${selectedCategory}`);
                    setItems(response.data);
                } catch (error) {
                    console.error('Error fetching items:', error);
                }
            } else {
                setItems([]);
            }
        };
        fetchItems();
    }, [selectedCategory]);

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const orders = Object.keys(selectedItems).map((itemId) => ({
                item_id: itemId,
                quantity: selectedItems[itemId],
            }));

            const response = await axios.post('/api/orders', {
                checkpost_id: checkpostId,
                orders,
            });
            setMessage(response.data.message);
            setSelectedItems({});
            setSelectedCategory('');
            setItems([]);
        } catch (error) {
            console.error('Error placing order:', error);
            setMessage('Failed to place order. Please try again.');
        }
    };

    // Handle item selection and quantity update
    const handleItemSelect = (itemId, quantity) => {
        if (quantity > 0) {
            setSelectedItems((prev) => ({
                ...prev,
                [itemId]: quantity,
            }));
        } else {
            const newSelectedItems = { ...selectedItems };
            delete newSelectedItems[itemId];
            setSelectedItems(newSelectedItems);
        }
    };

    return (
        <div className="orders-form">
            
            <form onSubmit={handleSubmit}>
            <h2>Place Order at Checkpost</h2>
                <div className="category-select">

                    <label htmlFor="category">Select Category:</label>
                    <select
                        id="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        required
                    >
                        <option value="" disabled>Select a category</option>
                        {categories.map((category) => (
                            <option key={category} value={category}>
                                {category}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="items-container">
                  
                    {items.map((item) => (
                        <div key={item.item_id} className="item-card">
                            <img src={item.image_path} alt={item.item_name} className="item-image" />
                            <div className="item-details">
                                <p className="item-name">
                                    <strong>{item.item_name}</strong>
                                </p>
                                <p className="item-info">
                                    Available: {item.quantity} {item.unit}
                                </p>
                                <input
                                    type="number"
                                    min="1"
                                    id="qt"
                                    value={selectedItems[item.item_id] || ''}
                                    onChange={(e) => handleItemSelect(item.item_id, e.target.value)}
                                    placeholder="Quantity"
                                    className="item-quantity-input"
                                />
                            </div>
                        </div>
                    ))}
                </div>
                <button type="submit" className="submit-button">Place Order</button>
            </form>
            {message && <p className="message">{message}</p>}
        </div>
    );
};

export default OrderForm;
