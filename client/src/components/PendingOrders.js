import React, { useEffect, useState } from 'react';
import axios from 'axios';

const PendingOrders = () => {
    const [orders, setOrders] = useState([]); // For pending orders
    const [approvedOrders, setApprovedOrders] = useState([]); // For approved orders
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
            }
        };

        const fetchApprovedOrders = async () => {
            try {
                const response = await axios.get('/api/orders/approved');
                setApprovedOrders(response.data);
            } catch (error) {
                console.error('Error fetching approved orders:', error);
                setError('Failed to load approved orders. Please try again.');
            }
        };

        fetchPendingOrders();
        fetchApprovedOrders();
        setLoading(false);
    }, []);

    const approveOrder = async (order) => {
        try {
            await axios.post('/api/orders/approve', {
                order_id: order.order_id,
                item_id: order.headquarter_item.item_id,
                quantity: order.quantity,
            });
            // Update local state to reflect approved order
            setOrders(orders.filter(o => o.order_id !== order.order_id));
            setApprovedOrders([...approvedOrders, order]); // Optionally add to approved orders
        } catch (error) {
            console.error('Error approving order:', error);
            setError('Failed to approve order. Please try again.');
        }
    };

    if (loading) {
        return <p>Loading orders...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div className='ao'>
          
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
                            <th>Status</th>
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
                                <td>{order.status}</td>
                                <td>
                                    <button onClick={() => approveOrder(order)}>Approve</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}

            <h2>Approved Orders</h2>
            {approvedOrders.length === 0 ? (
                <p>No approved orders available.</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Order ID</th>
                            <th>Checkpost Name</th>
                            <th>Item Name</th>
                            <th>Quantity</th>
                            <th>Date Ordered</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {approvedOrders.map((order) => (
                            <tr key={order.order_id}>
                                <td>{order.order_id}</td>
                                <td>{order.checkpost.name}</td>
                                <td>{order.headquarter_item.item_name}</td>
                                <td>{order.quantity} {order.headquarter_item.unit}</td>
                                <td>{new Date(order.date_ordered).toLocaleString()}</td>
                                <td>{order.status}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

export default PendingOrders;
