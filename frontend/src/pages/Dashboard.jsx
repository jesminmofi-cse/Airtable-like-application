import React, {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import axios from 'axios';
import './Dashboard.css';

const Dashboard=()=>{
    const [tables, setTables]=useState([]);
    const [username, setUsername]=useState('');
    const navigate=useNavigate();
    useEffect(()=>{
     const fetchData=async ()=>{
        try{
            const token=localStorage.getItem('token');
            const userRes=await axios.get('${process.env.REACT_APP_BASE_URL}/api/auth/me',{
                    headers:{Authorization:`Bearer ${token}`},
            });
            localStorage.setItem('username', userRes.data.name);
            setUsername(userRes.data.name);
            const tableRes=await axios.get('${process.env.REACT_APP_BASE_URL}/api/table',{
                headers:{Authorization:`Bearer ${token}`},
            });
            setTables(tableRes.data.tables); 
           }catch(error){
            console.error('Error fetching the data:', error);
        }
    };
    fetchData();
  },[]);
  const handleLogout=()=>{
    localStorage.removeItem('token');
    navigate('/login');
  };
  const handleCreateTable=()=>{
    navigate('/table');
  };
  return(
    <div className='dashboard'>
        <header className='dashboard-header'>
            <div className='logo'>TableCraft</div>
        <button onClick={handleLogout} className='btn'>
            Login/Register
        </button>
        </header>
        <main className="dashboard-main">
             <div className="left-section">
                  <h1>Hello, {username || 'User'}</h1>
                  <h2>Your Personal Table Playground</h2>
                  <button onClick={handleCreateTable}>Create New Table</button>
             </div>
       
        <div className='table-list'>
            {tables.length===0?(
                <p>We create the tables!!! <br/>Enjoy and play with rows and columns.</p>
            ):(
              
                tables.map((table,idx)=>(
                    <div key={idx} className='table-card'>
                        <h3>{table.tableName}</h3>
                        <button onClick={()=>navigate(`/table/${table._id}`)}>Open</button>
                    </div>
                ))
            )}
        </div>
    </main>
    </div>
  );
};
export default Dashboard;
