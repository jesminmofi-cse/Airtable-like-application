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
            navigate('/login');
            return;
        }

        const fetchData = async () => {
            try {
                const baseURL = process.env.REACT_APP_BASE_URL || 'http://localhost:5000';

                const userRes = await axios.get(`${baseURL}/api/auth/me`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const userNameFromResponse = userRes?.data?.name || 'User';
                setUsername(userNameFromResponse);
                localStorage.setItem('username', userNameFromResponse);

                const tableRes = await axios.get(`${baseURL}/api/table/history`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                const tablesData = Array.isArray(tableRes?.data?.tables)
                    ? tableRes.data.tables
                    : [];

                setTables(tablesData);
            } catch (error) {
                console.error('❌ Error fetching the data:', error.response?.data || error.message);
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
                    <h1>Hello, {username} 👋</h1>
                    <h2>Your Personal Table Playground</h2>
                    <button onClick={handleCreateTable}>Create New Table</button>
                </div>

                <div className='table-list'>
                    {Array.isArray(tables) && tables.length === 0 ? (
                        <p>
                            We create the tables!!! <br />
                            Enjoy and play with rows and columns.
                        </p>
                    ) : (
                        Array.isArray(tables) &&
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
