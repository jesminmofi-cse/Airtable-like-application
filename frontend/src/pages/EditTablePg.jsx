import React, {useState, useEffect,useRef } from 'react';
import axios from 'axios';
import {useParams} from 'react-router-dom';
import DownloadMenu from '../components/DownloadMenu';
import './TablePg.css';
const getCurrencySymbol=(code)=>{
  const symbols={
    USD: '$', INR: '₹', EUR: '€', GBP: '£', JPY: '¥',
    CNY: '¥', KRW: '₩', RUB: '₽', AUD: 'A$', CAD: 'C$'
  };
  return symbols[code?.toUpperCase()]|| code|| '';
};
const fieldTypes=['text', 'number', 'email', 'date', 'checkbox', 'dropdown', 'textarea', 'url', 'phone', 'currency'];
const EditTablePg=()=>{
  const tableRef = useRef(null);
  const { id } = useParams();
  const [tableName, setTableName] = useState('');
  const [fields, setFields] = useState([]);
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');
  const [sortField, setSortField] = useState('');
  const [sortOrder, setSortOrder] = useState('asc');

  useEffect(()=>{
    const fetchTable=async()=>{
      try{
        const token=localStorage.getItem('token');
        const res= await axios.get(`${process.env.REACT_APP_BASE_URL}/api/table/${id}`,{
          headers:{Authorization:`Bearer ${token}`},
        });
        setTableName(res.data.name);
        setFields(res.data.fields || []);
        setRows(res.data.data || []);
      }catch(err){
         console.error('Error loading table:', err);
      }
    };
    fetchTable();
  },[id]);
  const handleCellChange= (rowIndex, columnName, value) =>{
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnName] = value;
    setRows(updatedRows);
  };
  const renameColumn = (index, newName) => {
    const oldLabel = fields[index].label;
    const updatedFields = [...fields];
    updatedFields[index].label = newName;
    setFields(updatedFields);
    const updatedRows = rows.map(row => {
      const newRow = { ...row };
      newRow[newName] = newRow[oldLabel];
      delete newRow[oldLabel];
      return newRow;
    });
    setRows(updatedRows);
  };
  const deleteColumn=(index)=>{
    const colLabel = fields[index].label;
    const updatedFields = fields.filter((_, i) => i !== index);
    const updatedRows = rows.map(row => {
      const newRow = { ...row };
      delete newRow[colLabel];
      return newRow;
  });
  setFields(updatedFields);
  setRows(updatedRows);
};
const addRow = () => {
    const newRow = {};
    fields.forEach(field => {
      if (field.type === 'checkbox') newRow[field.label] = false;
      else if (['number', 'currency'].includes(field.type)) newRow[field.label] = 0;
      else newRow[field.label] = '';
    });
    setRows([...rows, newRow]);
};
const addColumn = () => {
    if (!newFieldLabel.trim()) return setMessage('Column name is required');
    if (fields.find(f => f.label === newFieldLabel)) return setMessage('Column name must be unique!');
    const newField = {
      label: newFieldLabel,
      type: newFieldType,
      required: false,
      options: newFieldType === 'dropdown' ? ['Option1', 'Option2'] : [],
      currency: newFieldType === 'currency' ? "INR" : null
};
const updatedFields = [...fields, newField];
    const updatedRows = rows.map(row => ({
      ...row,
      [newFieldLabel]: newFieldType === 'checkbox' ? false :
                       ['number', 'currency'].includes(newFieldType) ? 0 : ''
}));
  setFields(updatedFields);
    setRows(updatedRows);
    setNewFieldLabel('');
    setNewFieldType('text');
    setMessage('Column added successfully');
};
const deleteRow = (rowIndex) => {
    const updatedRows = [...rows];
    updatedRows.splice(rowIndex, 1);
    setRows(updatedRows);
};
 const changeColumnType = (index, newType) => {
    const updated = [...fields];
    const col = updated[index];
    if (newType === 'dropdown') {
      const opts = prompt('Enter dropdown options (comma separated):', 'Option1, Option2');
      col.options = opts.split(',').map((o) => o.trim());
    } else {
      delete col.options;
    }

    if (newType === 'currency') {
      const currencyCode = prompt('Enter currency code (e.g., USD, INR, EUR):', 'INR');
      col.currency = currencyCode;
    } else{delete col.currency;}
    col.type = newType;
    setFields(updated);};
const saveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${process.env.REACT_APP_BASE_URL}/api/table/${id}`,
        { name: tableName, fields, data: rows },
        { headers: { Authorization: `Bearer ${token}` } }
      ); setMessage('Changes saved successfully!');
    } catch (err) {console.error('Error saving changes:', err);
      setMessage('Error saving changes.');
    }};
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
      <DownloadMenu tableName={tableName} tableRef={tableRef}  columns={fields} rows={rows} theme={localStorage.getItem('theme') || 'light'}/>
      <div style={{marginBottom:'1rem'}}>
        <label>Sort by:&nbsp</label>
        <select value={sortField} onChange={(e)=>setSortField(e.target.value)}>
          <option value=''>--Select Column--</option>
          {fields.map((field) => (
              <option key={field.label} value={field.label}>{field.label}</option>
          ))}
        </select>
        &nbsp;
        <select value={sortOrder} onChange={(e)=> setSortOrder(e.target.value)}>
          <option value='asc'>A-Z</option>
          <option value='desc'>Z-A</option>
        </select>
      </div>
    <div className='table-page'>
      <h2>Edit table</h2>
      <input type='text' placeholder='Enter table name' value={tableName} onChange={(e)=> setTableName(e.target.value)} className='table-name-input'/>
      <div className='btn-group'>
        <div className='add-column'>
          <h4>Add New Column</h4>
          <input type='text' placeholder='Column name' value={newFieldLabel} onChange={(e)=>setNewFieldLabel(e.target.value)}/>
           <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)}>
             {fieldTypes.map((type) => (<option key={type} value={type}>{type}</option>
            ))}</select>
          <button onClick={addColumn}>Add Column</button> </div>
        <button onClick={addRow}>Add Row</button>
        <button onClick={saveChanges}>Save Changes</button>
      </div>
       {message && <p className='save-message'>{message}</p>}
       <div className='table-container' ref={tableRef}>
        <table>
          <thead>
            <tr>
              {fields.map((field, idx) => (
                <th key={idx}>
                  <div className='column-header-controls'>
                    <input type='text' value={field.label} onChange={(e) => renameColumn(idx, e.target.value)} />
                    <select  value={field.type}  onChange={(e) => changeColumnType(idx, e.target.value)}>
                      {fieldTypes.map((type) => (<option key={type} value={type}>{type}</option>))}
                    </select> <button onClick={() => deleteColumn(idx)} className='delete-btn'>delete</button>
                  </div></th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          
          <tbody>
             {sortedRows.map((row, rowIndex) => (<tr key={rowIndex}>
              {fields.map((field, colIndex) => (<td key={colIndex}>
                {field.type === 'textarea' ? (
                  <textarea value={row[field.label] || ''} onChange={(e) => handleCellChange(rowIndex, field.label, e.target.value)} />
                ) : field.type === 'dropdown' ? (
                   <select value={row[field.label]} onChange={(e) => handleCellChange(rowIndex, field.label, e.target.value)}>
                     <option value=''>---Select---</option>
                       {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                   </select>
                ):field.type === 'checkbox' ? (
                   <input type='checkbox' checked={row[field.label] === true || row[field.label] === 'true'} onChange={(e) => handleCellChange(rowIndex, field.label, e.target.checked)}/>
                ):(
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input type={field.type === 'phone' ? 'tel' : field.type === 'currency' ? 'number' : field.type} value={row[field.label] || ''} onChange={(e) => { let value = e.target.value;
                         if (['number', 'currency'].includes(field.type)) {
                              value = Number(value);
                            }
                             handleCellChange(rowIndex, field.label, value);
                          }}/>
                          {field.type === 'currency' && (  <span style={{ marginLeft: '6px', fontWeight: 'bold', color: '#4CAF50' }} title={field.currency}>
                             {getCurrencySymbol(field.currency)}
                          </span>
                )}
                </div>
                )}
              </td>
                ))}
                <td>
                  <button onClick={() => deleteRow(rowIndex)} className='row-delete-btn'>delete</button>
                </td>
        </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
   </>
  );
};

export default EditTablePg;
