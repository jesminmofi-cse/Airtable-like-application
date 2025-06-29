import React, { useState, useEffect, useRef } from 'react';
import './TablePg.css';
import axios from 'axios';
import DownloadMenu from '../components/DownloadMenu';
import { useNavigate } from 'react-router-dom';
const getCurrencySymbol = (code) => {
  const symbols = {
    USD: '$', INR: '₹', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥', KRW: '₩', RUB: '₽', AUD: 'A$', CAD: 'C$' };
  return symbols[code?.toUpperCase()] || code || '';};
const TablePg = () => {
  const tableRef = useRef(null);
  const navigate = useNavigate();
  const [tableName, setTableName] = useState('');
  const [columns, setColumns] = useState([{ label: 'Name', type: 'text' }, { label: 'Email', type: 'email' }]);
  const [rows, setRows] = useState([{ Name: '', Email: '' }]);
  const [message, setMessage] = useState('');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');
  const [history, setHistory]=useState([]);
  const [redoStack, setRedoStack]=useState([]);
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);  }}, [message]);
  const Maxhistory=50;
  const saveSnapshot=()=>{
    const snapshot={columns: JSON.parse(JSON.stringify(columns)), rows: JSON.parse(JSON.stringify(rows)) };
    setHistory((prev)=>[...prev.slice(-Maxhistory + 1), snapshot]);
    setRedoStack([]);
  }
  const addColumn = () => {
    saveSnapshot();
    const label = prompt('Enter column name:');
    const type = prompt('Enter column type(text, number, email, date, checkbox, dropdown, textarea, url, phone, currency):', 'text');
    if (!label || !type || !label.trim()) return;
    if (columns.find((col) => col.label === label)) {
      alert('Column name must be unique!');
      return; }
    const newCol = { label, type };
    if (type === 'currency') {
      const currencyCode = prompt('Enter currency code (e.g., USD, INR, EUR):', 'INR');
      newCol.currency = currencyCode;
    }
    if (type === 'dropdown') {
      const opts = prompt('Enter dropdown options (comma separated):', 'Option1, Option2');
      newCol.options = opts.split(',').map((o) => o.trim());
    }
    setColumns([...columns, newCol]);
    setRows(rows.map((row) => ({ ...row, [label]: '' })));
  };
  const undo=()=>{
    if (history.length===0) return;
    const lastState=history[history.length-1];
    setRedoStack((prev)=>[...prev,{columns,rows}]);
    setColumns(lastState.columns);
    setRows(lastState.rows);
    setHistory((prev)=>prev.slice(0,-1));
  }
  const redo=()=>{
    if (redoStack.length === 0) return;
    const nextState = redoStack[redoStack.length - 1];
    setHistory((prev) => [...prev, { columns, rows }]);
    setColumns(nextState.columns);
    setRows(nextState.rows);
    setRedoStack((prev) => prev.slice(0, -1));
  }
  const changeColumnType = (index, newType) => {
    saveSnapshot();
    const updated = [...columns];
    const col = updated[index];
    if (newType === 'dropdown' && !col.options) {
      const opts = prompt('Enter dropdown options (comma separated):', 'Option1, Option2');
      col.options = opts.split(',').map((o) => o.trim());
    }
    if (newType !== 'dropdown') delete col.options;
    if (newType === 'currency') {
      const currencyCode = prompt('Enter currency code (e.g., USD, INR, EUR):', 'INR');
      col.currency = currencyCode;
    } else {
      delete col.currency;
    }
    col.type = newType;
    setColumns(updated);
  };
  const renameColumn = (index, newName) => {
    saveSnapshot();
    if (!newName.trim()) {
      alert('Column name cannot be empty');
      return;
    }
    const oldLabel = columns[index].label;
    if (columns.find((col, idx) => idx !== index && col.label === newName)) {
      alert('Column name must be unique');
      return;
    }
    const updatedColumns = [...columns];
    updatedColumns[index].label = newName;
    setColumns(updatedColumns);
    setRows(rows.map((row) => {
      const newRow = { ...row };
      newRow[newName] = newRow[oldLabel];
      delete newRow[oldLabel];
      return newRow;
    }));
  };
  const addRow = () => {
    const newRow = {};
    columns.forEach((col) => {
      if (col.type === 'checkbox') newRow[col.label] = false;
      else if (col.type === 'number') newRow[col.label] = 0;
      else newRow[col.label] = '';
    });
    setRows([...rows, newRow]);
  };
  const cellChangeTimeout = useRef(null);

  const handleCellChange = (rowIndex, columnName, value) => {
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnName] = value;
    setRows(updatedRows);
    clearTimeout(cellChangeTimeout.current);
    cellChangeTimeout.current=setTimeout(()=>{
      saveSnapshot();
    },800);
  };
  const deleteColumn = (index) => {
    saveSnapshot();
    const colToDelete = columns[index].label;
    setColumns(columns.filter((_, i) => i !== index));
    setRows(rows.map((row) => {
      const newRow = { ...row };
      delete newRow[colToDelete];
      return newRow;
    }));
  };
  const deleteRow = (rowIndex) => {
    saveSnapshot();
    const updatedRows = [...rows];
    updatedRows.splice(rowIndex, 1);
    setRows(updatedRows);
  };
  
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validateURL = (url) => /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i.test(url);
  const saveTable = async () => {
  if (!tableName.trim()) return setMessage('Please enter a table name');

  const nonEmptyRows = rows.filter(row =>
    Object.values(row).some(value => value !== '' && value !== null)
  );

  for (let i = 0; i < nonEmptyRows.length; i++) {
    const row = nonEmptyRows[i];
    for (let col of columns) {
      const val = row[col.label];
      if (col.type === 'email' && val && !validateEmail(val)) {
        setMessage(`Invalid email in row ${i + 1}, column "${col.label}"`);
        return;
      }
      if (col.type === 'url' && val && !validateURL(val)) {
        setMessage(`Invalid URL in row ${i + 1}, column "${col.label}"`);
        return;
      }
      if (col.type === 'currency' && val && isNaN(val)) {
        setMessage(`Invalid currency value in row ${i + 1}, column "${col.label}"`);
        return;
      }
    }
  }

  try {
    const token = localStorage.getItem('token');

    const payload = {
      name: tableName,
      fields: columns.map((col) => ({
        label: col.label,
        type: col.type,
        required: false,
        options: col.options || [],
        currency: col.currency || null,
      })),
      data: nonEmptyRows,
    };

    console.log("🔍 Saving payload:", payload);

    await axios.post('https://airtable-backend.onrender.com/api/table', payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    setMessage('✅ Table saved successfully!');
  } catch (error) {
    console.error('❌ Error saving the table:', error);

    if (error.response) {
      console.error(' Server responded with:', error.response.data);
      setMessage(`Server error: ${error.response.data?.message || 'Unknown error'}`);
    } else if (error.request) {
      console.error(' No response received. Request was:', error.request);
      setMessage('No response from server. Please check your internet or server.');
    } else {
      console.error('🧠 Error setting up request:', error.message);
      setMessage(`Error: ${error.message}`);
    }
  }
};

   const sortedRows=[...rows];
          if(sortField){
            sortedRows.sort((a,b)=>{
              const valA=String(a[sortField] || '').toLowerCase();
              const valB = String(b[sortField] || '').toLowerCase();
              if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
              if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
              return 0;
            });
          }
  return (
    <>
      <DownloadMenu tableName={tableName} tableRef={tableRef} columns={columns} rows={rows} theme={localStorage.getItem('theme') || 'light'} />
      <div style={{marginBottom:'1rem'}}>
        <label>Sort by:</label>
        <select value={sortField} onChange={(e)=>setSortField(e.target.value)}>
          <option value=''>--Select Column--</option>
          {columns.map((col) => (
          <option key={col.label} value={col.label}>{col.label}</option>
        ))}
        </select>
        &nbsp;
        <select value={sortOrder} onChange={(e)=> setSortOrder(e.target.value)}>
          <option value='asc'>A-Z</option>
          <option value='desc'>Z-A</option>
          
        </select>
      </div>
      <div className='table-page'>
        <h2>Create a table</h2>
        <input type='text' placeholder='Enter table name...' value={tableName} onChange={(e) => setTableName(e.target.value)} className='table-name-input' />
        <div className='top-right'>
          <button onClick={() => navigate('/history')}>View Table</button>
        </div>
        <div className='btn-group'>
          <button onClick={addColumn}>Add Column</button>
          <button onClick={addRow}>Add Row</button>
          <button onClick={saveTable}>Save</button>
          <button onClick={undo} disabled={history.length === 0}>Undo</button>
          <button onClick={redo} disabled={redoStack.length === 0}>Redo</button>
        </div> {message && <p className='save-message'>{message}</p>}
        <div ref={tableRef} className='table-container'>
          <table className="table">
                <thead> <tr>
                {columns.map((col, idx) => (
                  <th key={idx}>
                         <div className='column-header'>
                               <input type='text' value={col.label} onChange={(e) => renameColumn(idx, e.target.value)} />
                      <select value={col.type} onChange={(e) => changeColumnType(idx, e.target.value)}>
                        {['text', 'number', 'email', 'date', 'checkbox', 'dropdown', 'textarea', 'url', 'phone', 'currency'].map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                      <button onClick={() => deleteColumn(idx)} className='delete-btn'>Delete</button>
                    </div>
                  </th>
                ))}<th>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                        <tr key={rowIndex}>
                           {columns.map((col, colIndex) => (
                    <td key={colIndex}>
                            {col.type === 'textarea' ? (
                        <textarea value={row[col.label] || ''} onChange={(e) => handleCellChange(rowIndex, col.label, e.target.value)} />
                      ) : col.type === 'dropdown' ? (
                        <select value={row[col.label]} onChange={(e) => handleCellChange(rowIndex, col.label, e.target.value)}>
                          <option value=''>---Select---</option>
                          {(col.options || []).map((opt, i) => <option key={i} value={opt}>{opt}</option>)}
                                   </select>
                      ) : col.type === 'checkbox' ? (
                                   <input type='checkbox' checked={row[col.label] === true || row[col.label] === 'true'} onChange={(e) => handleCellChange(rowIndex, col.label, e.target.checked)} />
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <input type={col.type === 'phone' ? 'tel' : col.type === 'currency' ? 'number' : col.type} value={row[col.label] || ''} onChange={(e) => {
                              let value = e.target.value;
                              if (col.type === 'number' || col.type === 'currency') value = Number(value);
                              handleCellChange(rowIndex, col.label, value);
                            }}/>
                          {col.type === 'currency' && (
                            <span style={{ marginLeft: '6px', fontWeight: 'bold', color: '#4CAF50' }} title={col.currency}>
                              {getCurrencySymbol(col.currency)}
                            </span>
                          )}</div>
                      )}
                    </td>
                  ))}<td> <button onClick={() => deleteRow(rowIndex)} className='delete-btn'>Delete</button> </td> </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div></>
  );
};
export default TablePg;
