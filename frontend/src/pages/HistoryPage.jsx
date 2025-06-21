import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './HistoryPage.css';
import { useNavigate } from 'react-router-dom';
const HistoryPage = () => {
  const [tables, setTables] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  useEffect(() => {
    const fetchTables = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/table/history', {
          headers: { Authorization: `Bearer ${token}`, },
        });
        setTables(response.data);
      } catch (err) {
        console.error('Error fetching the data', err);
        setError('Failed to fetch table history');
      } finally { setLoading(false);}
    };fetchTables();
  }, []);
  const handleDelete =async(tableId)=>{
    const confirmed = window.confirm('Are you sure you want to delete this table?');
    if (!confirmed) return;
    try {
      const token = localStorage.getItem('token');
    await axios.delete(`http://localhost:5000/api/table/${tableId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setTables(tables.filter((table) => table._id !== tableId));
  }catch (err) {
    console.error('Error deleting table:', err);
    alert('Failed to delete the table.');
  }
};
  const handleEdit = (tableId) => {
    navigate(`/edit/${tableId}`);
  };
  return (
    <div className="history-page">
      <h2> Table History</h2>
      {loading ? (
        <p>Loading History...</p>
      ) : error ? (
        <p className="err-msg">{error}</p>
      ) : tables.length === 0 ? (
        <p className="empty-msg">You haven't created any table yet.</p>
      ) : (
        <div className="table-list">
          {tables.map((table) => (
  <div key={table._id} className="history-card">
    <button  className="delete-btn" onClick={() => handleDelete(table._id)} title="Delete table" >
    ✖
  </button>
    <div className='extra'>
    <h3>{table.name}</h3>
    <p><strong>Fields:</strong> {table.fields.length}</p>
    <p><strong>Created:</strong> {new Date(table.createdAt).toLocaleString()}</p>
    <p><strong>Last Updated:</strong> {new Date(table.updatedAt).toLocaleString()}</p>
    <button onClick={() => handleEdit(table._id)}>Edit Table</button>
  </div></div>
))}
        </div>
      )}
    </div>
   
  );
};
export default HistoryPage;