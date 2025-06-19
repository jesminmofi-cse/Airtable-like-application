import React, {useState} from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login=()=>{
    const [formData, setFormData]=useState({email:'', password:''});
    const navigate=useNavigate();
    const [error, setError]= useState('');
    const handleChange=(e)=>{
        setFormData({...formData,[e.target.name]:e.target.value});
    };
    const handleSubmit=async(e)=>{
        e.preventDefault();
        try{
            const res=await axios.post('http://localhost:5000/api/auth/login', formData);
            localStorage.setItem('username', res.data.user.name);
            localStorage.setItem('token', res.data.token);
            navigate('/');
        }catch(err){
            setError(err.response?.data?.msg || 'Invalid credentials');
        }
    };
    return (
        <div className='auth-container'>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input type='email' name='email' placeholder='Email' value={formData.email} onChange={handleChange} required/>
                <input type='password' name='password' placeholder='Password' value={formData.password} onChange={handleChange} required/>
                <button type="submit">Login</button>
            </form>
            {error && <p className='auth-error'>{error}</p>}
            <p className='auth-switch'> Don't have an account ? <Link to ='/register'>Register</Link>  </p>
        </div>
    );
};
export default Login;