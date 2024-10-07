// @ts-nocheck

import React, { useState } from 'react';

function Register() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await response.json();
            console.log("Response data:", data); // Log the response data for debugging

            if (data.success) {
                window.location.href = data.redirect;
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('Registration failed. Please try again.');
        }
    };

    return (
        <div>
            <h1 className='login-container'>Register</h1>
            <form onSubmit={handleSubmit} className='login-form'>
                <label htmlFor="username">Username:</label>
                <input
                    type="text"
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="password">Password:</label>
                <input
                    type="password" // Changed to password type
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Register</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default Register;
