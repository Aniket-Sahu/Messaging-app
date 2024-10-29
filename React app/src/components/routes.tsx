import { Routes, Route } from 'react-router-dom';
import React from 'react';
import Home from './Home';
import Login from './Login';
import Register from './Register';
import App from './App';

interface routeProps{
    authenticated: boolean;
    loading: boolean;
}

const Router: React.FC<routeProps> = ({ authenticated, loading }) => {
    console.log("Router Authenticated:", authenticated);

    if (loading) {
        return <div>Loading...</div>;  
    }

    return (
        <Routes>
            {authenticated ? (
                <>
                    <Route path="/app" element={<App />} />
                    <Route path="/" element={<App />} />
                </>
            ) : (
                <>
                    <Route path="/login" element={<Login />} />
                    <Route path="/register" element={<Register />} />
                    <Route path="/" element={<Home />} />
                </>
            )}
        </Routes>
    );
};

export default Router;