import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ApprovedOrdersTable = () => {
    const [approvedOrders, setApprovedOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchApprovedOrders = async () => {
            try {
                const response = await axios.get('/api/orders/approved');
                setApprovedOrders(response.data);
            } catch (error) {
                console.error('Error fetching approved orders:', error);
                setError('Failed to load approved orders. Please try again.');
            } finally {
                setLoading(false);
            }
        };

        fetchApprovedOrders();
    }, []);

    if (loading) {
        return <p>Loading approved orders...</p>;
    }

    if (error) {
        return <p>{error}</p>;
    }

    return (
        <div>
           
            {approvedOrders.length === 0 ? (
                <p>No approved orders available.</p>
            ) : (
                <table  style={{fontSize: "0.8em"}}>
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

export default ApprovedOrdersTable;
