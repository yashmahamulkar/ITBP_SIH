import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PendingOrdersTable = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchPendingOrders = async () => {
            try {
                const response = await axios.get('/api/orders/pending');
                setOrders(response.data);
            } catch (error) {
                console.error('Error fetching pending orders:', error);
                setError('Failed to load pending orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchPendingOrders();
    }, []);

    const approveOrder = async (order) => {
        try {
            await axios.post('/api/orders/approve', {
                order_id: order.order_id,
                item_id: order.headquarter_item.item_id,
                quantity: order.quantity,
            });
            // Update the local state to remove the approved order from pending orders
            setOrders(orders.filter(o => o.order_id !== order.order_id));
        } catch (error) {
            console.error('Error approving order:', error);
            setError('Failed to approve order. Please try again.');
        }
    };

    if (loading) {
        return <p>Loading pending orders...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
            <h2>Pending Orders</h2>
            {orders.length === 0 ? (
                <p>No pending orders available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Checkpost Name</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Date Ordered</th>
                    
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{order.checkpost.name}</td>
                                <td>{order.headquarter_item.item_name}</td>
                                <td>{order.quantity} {order.headquarter_item.unit}</td>
                                <td>{new Date(order.date_ordered).toLocaleString()}</td>
                               
                                <td>
                                    <button style={{height: 30,fontSize:"0.6em"}} onClick={() => approveOrder(order)}>Approve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PendingOrdersTable;
