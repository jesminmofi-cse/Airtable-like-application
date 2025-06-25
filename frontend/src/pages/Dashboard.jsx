import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
    const [tables, setTables] = useState([]);
    const [username, setUsername] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const token = localStorage.getItem('token');

        if (!token) {
            console.warn('🚫 No token found. Redirecting to login...');
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                console.log("🔐 Using BASE URL:", process.env.REACT_APP_BASE_URL);

                // Fetch authenticated user info
                const userRes = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("✅ User data:", userRes.data);
                localStorage.setItem('username', userRes.data.name);
                setUsername(userRes.data.name);

                // Fetch user tables
                const tableRes = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/table`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                console.log("📋 Tables:", tableRes.data.tables);
                setTables(tableRes.data.tables);
            } catch (error) {
                console.error('❌ Failed to fetch data:', error.response?.data || error.message);
                localStorage.removeItem('token');
                navigate('/login');
            }
        };

        fetchData();
    }, [navigate]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    const handleCreateTable = () => {
        navigate('/table');
    };

    return (
        <div className='dashboard'>
            <header className='dashboard-header'>
                <div className='logo'>TableCraft</div>
                <button onClick={handleLogout} className='btn'>
                    Logout
                </button>
            </header>

            <main className='dashboard-main'>
                <div className='left-section'>
                    <h1>Hello, {username || 'User'} 👋</h1>
                    <h2>Your Personal Table Playground</h2>
                    <button onClick={handleCreateTable}>Create New Table</button>
                </div>

                <div className='table-list'>
                    {tables.length === 0 ? (
                        <p>
                            No tables yet! <br />
                            Create one and unleash your inner spreadsheet wizard 🧙‍♀️📊
                        </p>
                    ) : (
                        tables.map((table, idx) => (
                            <div key={idx} className='table-card'>
                                <h3>{table.tableName}</h3>
                                <button onClick={() => navigate(`/table/${table._id}`)}>Open</button>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
