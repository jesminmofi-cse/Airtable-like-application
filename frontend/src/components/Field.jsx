import React from 'react';

const Field=({type, value, onChange,options=[],error})=>{
    const handleChange=(e)=>{
        const val = type === 'checkbox' ? e.target.checked : e.target.value;
        onChange(val);
    };
    switch (type) {
        case 'text':
        case 'longText':
        case 'phone':
        case 'url':
           return (
            <>
               <input type='text' value={value || ''} onChange={handleChange} placeholder={type==='phone' ? 'Phone number':''}/>
               {error && <p className='error'>{error}</p>}
            </>
           );
        case 'number':
            return (
                <>
                   <input type='number' value={value || ''} onChange={handleChange}/>
                    {error && <p className='error'>{error}</p>}
                </>
            );
        case 'dropdown':
            return (
                <>
                  <select value ={value || ''} onChange={handleChange}>
                    <option value=''>--Select--</option>
                    {options.map((opt,idx)=>(
                        <option key={idx} value={opt}>{opt}</option>
                    ))}
                  </select>
                    {error && <p className='error'>{error}</p>}
                </>
            );
            case 'checkbox':
                return (
                <>
                   <input type='checkbox' value={value || false} onChange={handleChange}/>
                    {error && <p className='error'>{error}</p>}
                </>
            );
            default:
                return (
                <>
                   <input type='text' value={value || ''} onChange={handleChange} placeholder='Unsupported type'/>
                    {error && <p className='error'>{error}</p>}
                </>
            );
    }
};
export default Field;