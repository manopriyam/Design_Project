    import React, { useEffect, useState } from 'react';
    import axios from 'axios';
    import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

    const RealTimeStatistics = ({ deviceId }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_HTTP_SERVER_URL}/api/data/statistics/${deviceId}`);
            console.log(response.data.statistics);
            setHistoryData(response.data.statistics);
        } catch (err) {
            setError('Failed to Fetch Device Statistics');
        } finally {
            setLoading(false);
        }
        };

        fetchHistory();
    }, [deviceId]);

    return (
        <div>
            <h3>Device Energy Consumption History</h3>
            <ResponsiveContainer width={800} height={400} style={{ background: 'rgba(0, 0, 0, 0.43)', padding: '60px 60px 30px 30px', borderRadius: '10px' }}>
                <LineChart data={historyData}>
                    <XAxis dataKey="createdAt" tick={false} />
                    <YAxis />
                    <Tooltip content={({ payload, label }) => {
                        if (!payload || payload.length === 0) return null;
                        return (
                            <div style={{ background: 'black', padding: '10px', borderRadius: '5px', boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.11)' }}>
                            <p><strong>Time:</strong> {label}</p>
                            <p><strong>Energy:</strong> {payload[0].value}</p>
                            </div>
                        );
                        }} 
                    />
                    <Line type="monotone" dataKey="energy" stroke="#8884d8" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
    };

    export default RealTimeStatistics;
