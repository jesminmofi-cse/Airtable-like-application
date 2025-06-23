import React, {useState} from 'react';
import axios from 'axios';
import {useNavigate, Link} from 'react-router-dom';
import './Register.css';
const Register=()=>{
    const [formData, setFormData]=useState({
        name:'',
        email:'',
        password:''
    });
    const [error, setError]=useState('');
    const navigate= useNavigate();
    const handleChange=(e)=>{
        setFormData({
            ...formData,
            [e.target.name]:e.target.value
        });
    };
    const handleSubmit= async(e)=>{
        e.preventDefault();
        setError('');
        try{
            const res=await axios.post(`https://airtable-like-application-3.onrender.com/api/auth/register`, formData);
            localStorage.setItem('token', res.data.token);
            localStorage.setItem('username', res.data.user.name);
            navigate('/');
        }catch(err){
            if (err.response  && err.response.data && err.response.data.msg){
                setError(err.response.data.msg);
            }else{
                setError('Failed registration');
            }
        }
    };
    return (
        <div className='auth-container'>
            <h2>Register</h2>
            <form onSubmit={handleSubmit}>
                <input type='text' name='name' placeholder='Full Name' value={formData.name} onChange={handleChange} required/>
                <input type='email' name='email' placeholder='email' value={formData.email} onChange={handleChange} required/>
                <input type='password' name='password' placeholder='password' value={formData.password} onChange={handleChange} required/>
                <button type='submit'>Register</button>
            </form>
            {error && <p className='auth-error'>{error}</p>}
            <p className='auth-switch'>
                Already a user<Link to ='/login'>Login</Link>
            </p>
        </div>
    );
};
export default Register;
