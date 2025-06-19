import React , {useState, useEffect}from "react";
import axios from 'axios';
import { useParams, useNavigate } from "react-router-dom";
import './TablePg.css';

const getCurrencySymbol=(code)=>{
  const symbols = {
    USD: '$',
    INR: '₹',
    EUR: '€',
    GBP: '£',
    JPY: '¥',
    CNY: '¥',
    KRW: '₩',
    RUB: '₽',
    AUD: 'A$',
    CAD: 'C$'
  };
  return symbols[code?.toUpperCase()] || code || '';
};
const fieldTypes=['text', 'number', 'email', 'date', 'checkbox', 'dropdown', 'textarea', 'url', 'phone', 'currency'];
const EditTablePg=()=>{
  const {id} =useParams();
  const navigate=useNavigate();
  const [tableName, setTableName]=useState('');
  const [fields, setFields]=useState([]);
  const [rows, setRows]=useState([]);
  const [message, setMessage]=useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('text');

  useEffect (()=>{
    const fetchTable =async()=>{
      try{
        const token =localStorage.getItem('token');
        const res=await axios.get(`http://localhost:5000/api/table/${id}`,{
          headers:{Authorization:`Bearer${token}`},
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
  const handleCellChange=(rowIndex, columnName, value)=>{
    const updatedRows = [...rows];
    updatedRows[rowIndex][columnName] = value;
    setRows(updatedRows);
  };
  const renameColumn=(index, newName)=>{

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
const deleteColumn = (index) => {
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
      if (field.type === 'checkbox') {
                    newRow[field.label] = false;
      } else if (field.type === 'number' || field.type === 'currency') {
            newRow[field.label] = 0;
      } else {
           newRow[field.label] = '';
      }
    });
    setRows([...rows, newRow]);
  };
const addColumn=()=>{
  
    if(!newFieldLabel.trim()){
      setMessage('Column name is required');
      return;
    }
    if( fields.find(f=>f.label===newFieldLabel)){
      setMessage('Column name must be unique!');
      return;
    }
    const newField={
      label:newFieldLabel,
      type:newFieldType,
      required:false,
      options:newFieldType === 'dropdown' ? ['Option1', 'Option2']:[],
      currency: newFieldType==='currency' ? "INR" :null
    };
    const updatedFields=[...fields, newField];
    const updatedRows= rows.map(row=>({
      ...row,
      [newFieldLabel]:newFieldType==='checkbox'? false:newFieldType==='number' || newFieldType ==='currency' ?0:''
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
    } else {
      delete col.currency;
    }
    col.type = newType;
    setFields(updated);
};
const saveChanges = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `http://localhost:5000/api/table/${id}`,
        { name: tableName,
          fields: fields,
          data: rows,
        },
        { headers: { Authorization: `Bearer ${token}` }, }
      );
      setMessage('Changes saved successfully!');
    } catch (err) {
      console.error('Error saving changes:', err);
      setMessage('Error saving changes.');
    }
  };
return (
    <div className='table-page'>
      <h2>Edit table</h2>
      <input type='text' placeholder='Enter table name' value={tableName} onChange={(e) => setTableName(e.target.value)} className='table-name-input' />
      <div className='btn-group'>
        <div className='add-column'><h4>Add New Column</h4>
        <input type='text' placeholder='Column name'  value={newFieldLabel} onChange={(e) => setNewFieldLabel(e.target.value)}/>
        <select value={newFieldType} onChange={(e) => setNewFieldType(e.target.value)} >
           {fieldTypes.map((type) => (
            <option key={type} value={type}>{type}</option>
           ))}
        </select>
         <button onClick={addColumn}>Add Column</button>
        </div>
        <button onClick={addRow}>Add Row</button>
        <button onClick={saveChanges}>Save Changes</button>
      </div>
      {message && <p className='save-message'>{message}</p>}
      <div className='table-container'>
        <table>
          <thead>
            <tr>
              {fields.map((field, idx) => (
                <th key={idx}>
                  <div className='column-header-controls'>
                    <input type='text' value={field.label} onChange={(e) => renameColumn(idx, e.target.value)} />
                    <select
                      value={field.type}
                      onChange={(e) => changeColumnType(idx, e.target.value)} >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                    <button onClick={() => deleteColumn(idx)} className='delete-btn'>delete</button>
                  </div>
                </th>
              ))}
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {fields.map((field, colIndex) => (
                  <td key={colIndex}>
                    {field.type === 'textarea' ? (
                      <textarea value={row[field.label] || ''} onChange={(e) => handleCellChange(rowIndex, field.label, e.target.value)} />
                    ) : field.type === 'dropdown' ? (
                      <select value={row[field.label]} onChange={(e) => handleCellChange(rowIndex, field.label, e.target.value)} >
                        <option value=''>---Select---</option>
                        {(field.options || []).map((opt, i) => (
                          <option key={i} value={opt}>{opt}</option>
                        ))}
                      </select>
                    ) : field.type === 'checkbox' ? (
                      <input type='checkbox' checked={row[field.label] === true || row[field.label] === 'true'} onChange={(e) => handleCellChange(rowIndex, field.label, e.target.checked)}/>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <input type={field.type === 'phone' ? 'tel' : field.type === 'currency' ? 'number' : field.type}  value={row[field.label] || ''} onChange={(e) => {
                            let value = e.target.value;
                            if (field.type === 'number' || field.type === 'currency') {
                              value = Number(value);
                            }
                            handleCellChange(rowIndex, field.label, value);
                          }}/>
                        {field.type === 'currency' && (
                          <span style={{ marginLeft: '6px', fontWeight: 'bold', color: '#4CAF50' }} title={field.currency} >
                            {getCurrencySymbol(field.currency)}
                          </span>
                        )}</div>
                    )}</td>
                ))}<td><button onClick={() => deleteRow(rowIndex)} className='delete-btn'>delete</button> </td>
              </tr>
            ))}</tbody></table></div>
    </div>
  );
};
export default EditTablePg;