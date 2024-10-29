import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Main from './main';
import AddPage from './addPage';
  
interface friends {
    user_id: number;
    friend_user_id: number;
}

interface User {
    user_id: number;
    username: string;
} 

interface AuthStatus {
    authenticated: boolean;
    user: User;
}  

interface addFriendResponse{
    error?: string;
    friend?: friends;
}

const App: React.FC = () =>{
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true); 
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
    const [showMain, setShowmain] = useState<boolean>(true);  

    useEffect(() => {
        const checkAuthStatus = async () => {
            try {
                const response = await fetch('/auth-status', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data: AuthStatus = await response.json();
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

    const handleAddFriend = async (friendName: string) => {
        try {
            const response = await fetch('/api/addFriend', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({friendName: friendName}),
            });
            const data: addFriendResponse = await response.json();
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
                user ? ( 
                    <Main 
                        user={user} 
                        selectedFriend={selectedFriend} 
                        setAuthenticated={setAuthenticated}
                    />
                ) : (
                    <div>No user found. Please log in.</div> 
                )
            ) : (
                <AddPage handleAddFriend={handleAddFriend}/>
            )}
        </div>
    );
}

export default App;
