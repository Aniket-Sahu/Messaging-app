import React, { useState } from 'react';

interface LoginResponse{
    message?: string;
    success: boolean;
}

const Login: React.FC = () => {
    const [username, setUsername] = useState<string>('');
    const [password, setPassword] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({ username, password }),
            });

            const data: LoginResponse = await response.json();
            console.log("Response data:", data); 

            if (response.ok && data.success) {
                window.location.href = '/app'; 
            } else {
                setError(data.message || 'Login failed');
            }
        } catch (error: unknown) {
            setError("Login failed. Please try again.");
        }
    };

    return (
        <div className='login-container'>
            <h1>Login</h1>
            <form onSubmit={handleSubmit} className='login-form'>
                <label htmlFor="username">Username: </label>
                <input
                    type="text"
                    id="username" 
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                />
                <label htmlFor="password">Password:</label>
                <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Login</button>
                {error && <p style={{ color: 'red' }}>{error}</p>}
            </form>
        </div>
    );
}

export default Login;
