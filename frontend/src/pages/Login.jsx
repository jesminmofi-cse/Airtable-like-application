import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import './Login.css';

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false); // For future use
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            console.log("Sending login request to:", process.env.REACT_APP_BASE_URL);
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/auth/login`, formData);

            console.log("Login response:", res.data);

            const username = res?.data?.user?.name;
            const token = res?.data?.token;

            if (!username || !token) {
                setError("Unexpected response structure from server");
                setLoading(false);
                return;
            }

            localStorage.setItem('username', username);
            localStorage.setItem('token', token);

            console.log("Login successful, navigating to '/'");
            navigate('/');
        } catch (err) {
            console.error("Login failed:", err.response?.data?.msg || err.message);
            setError(err.response?.data?.msg || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='auth-container'>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type='email'
                    name='email'
                    placeholder='Email'
                    value={formData.email}
                    onChange={handleChange}
                    required
                />
                <input
                    type='password'
                    name='password'
                    placeholder='Password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <button type='submit' disabled={loading}>
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {error && <p className='auth-error'>{error}</p>}
            <p className='auth-switch'>
                Don't have an account? <Link to='/register'>Register</Link>
            </p>
        </div>
    );
};

export default Login;
