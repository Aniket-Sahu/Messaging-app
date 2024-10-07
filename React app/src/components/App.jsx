// @ts-nocheck

import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar.jsx';
import Main from './main.jsx';
import AddPage from './addPage.jsx';

function App() {
    const [authenticated, setAuthenticated] = useState(false);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true); 
    const [selectedFriend, setSelectedFriend] = useState(null);
    const [showMain, setShowmain] = useState(true);  

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('/auth-status', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data = await response.json();
                setAuthenticated(data.authenticated);
                if (data.authenticated) {
                    setLoading(false);
                    setUser(data.user);
                }
            } catch (error) {
                console.error('Error checking auth status:', error);    
                setLoading(false); 
            }
        };
        checkAuthStatus();
    }, []);

    const handleAddFriend = async (friendName) => {
        try {
            const response = await fetch('/api/addFriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({friendName: friendName}),
            });
            const data = await response.json();
            if (response.ok) {
                console.log("Friend added successfully", data);
                setShowmain(true); 
            } else {
                console.error('Error adding friend:', data.error);
            }
        } catch (error) {
            console.error('Error adding friend:', error);
        }
    };
    
    if (loading) return <div>Loading...</div>;

    if (!authenticated) return <div>Please log in...</div>;

    return (
        <div className="app-container">
            <Sidebar user={user} setSelectedFriend={setSelectedFriend} setShowmain={setShowmain} />
            {showMain ? (
                <Main user={user} selectedFriend={selectedFriend} setAuthenticated={setAuthenticated}/>
            ) : (
                <AddPage handleAddFriend={handleAddFriend}/>
            )}
        </div>
    );
}

export default App;
