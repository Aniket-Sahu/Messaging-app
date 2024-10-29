import React, { useState } from 'react';

interface RegisterResponse{
    message?: string;
    success?: boolean;
    redirect?: string;
}

const Register: React. FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data: RegisterResponse = await response.json();
            console.log("Response data:", data); 

            if (data.success && data.redirect) {
                window.location.href = data.redirect;
            } else {
                setError(data.message || "Register failed");
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
