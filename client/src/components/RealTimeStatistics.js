import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

import "./RealTimeStatistics.css";

const RealTimeStatistics = ({ deviceId }) => {
    const [historyData, setHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_HTTP_SERVER_URL}/api/data/statistics/${deviceId}`);
                let data = response.data.statistics;
                data.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
                setHistoryData(data);
            } catch (err) {
                setError('Failed to Fetch Device Statistics');
            } finally {
                setLoading(false);
            }
        };

        fetchHistory();
        const intervalId = setInterval(fetchHistory, process.env.REACT_APP_FETCH_UPDATES_INTERVAL * 1000 || 15000);

        return () => clearInterval(intervalId);
    }, [deviceId]);

    return (
        <div className="stats-chart-container">
            <h3 className="stats-chart-header">Device Energy Consumption History</h3>
            <ResponsiveContainer className="stats-chart">
                <LineChart data={historyData}>
                    <XAxis dataKey="createdAt" tick={false} stroke="var(--primary-font-color)" />
                    <YAxis stroke="var(--primary-font-color)" />
                    <Tooltip
                        content={({ payload, label }) => {
                            if (!payload || payload.length === 0) return null;
                            return (
                                <div className="stats-chart-tooltip">
                                    <p><strong>Time:</strong> {label}</p>
                                    <p><strong>Energy:</strong> {payload[0].value}</p>
                                </div>
                            );
                        }}
                        cursor={{ className: "stats-chart-tooltip-cursor" }}
                    />
                    <Line type="monotone" dataKey="energy" stroke="var(--secondary-font-color)" />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};

export default RealTimeStatistics;
