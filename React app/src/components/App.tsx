import React, { useState, useEffect } from 'react';
import Sidebar from './sidebar';
import Main from './main';
import AddPage from './addPage';
import { type } from 'os';
  
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

interface friendReq {
    req_id?: number;
    username: string;
    user_id: number;
    friend_id: number; 
    status: 'pending' | 'accepted' | 'rejected';
    timestamp: Date; 
}


const App: React.FC = () =>{
    const [authenticated, setAuthenticated] = useState<boolean>(false);
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true); 
    const [selectedFriend, setSelectedFriend] = useState<User | null>(null);
    const [showMain, setShowmain] = useState<boolean>(true);  
    const [friendReqs, setFriendReqs] = useState<friendReq[]>([]);

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
        const fetchingFriendReqs = async () => {
            try {
                const response = await fetch('/friendReqs', {
                    method: 'GET',
                    credentials: 'include',
                });
                const data: friendReq[] = await response.json();
                setFriendReqs(data);
            } catch (error) {
                console.error('Error getting friend requests', error);    
            }
        }
        checkAuthStatus();
        fetchingFriendReqs();
    }, []);

    

    const handleAddFriend = async (friendUID: number | undefined): Promise<void>=> {
        if(friendUID === undefined){
            console.warn("Friend UID can't be null");
            return;
        }
        try {
            const response = await fetch('/api/sendFriendReq', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ friendUID }),
            });
            const data: addFriendResponse = await response.json();
            if (response.ok) {
                console.log("Friend req sent successfully", data);
                setShowmain(true); 
            } else {
                console.error('Error sending friendReq:', data.error);
            }
        } catch (error) {
            console.error('Error sending friendReq:', error);
        }
    };
    
    if (loading) return <div>Loading...</div>;

    if (!authenticated) return <div>Please log in...</div>;

    return (
        <div className="app-container">
            <Sidebar user={user} setSelectedFriend={setSelectedFriend} showMain={showMain} setShowmain={setShowmain} />
            {showMain ? (
                user ? ( 
                    <Main 
                        user={user} 
                        selectedFriend={selectedFriend} 
                        setAuthenticated={setAuthenticated}
                        friendReqs={friendReqs}
                    />
                ) : (
                    <div>No user found. Please log in.</div> 
                )
            ) : (
                <AddPage handleAddFriend={handleAddFriend} setShowmain={setShowmain}/>
            )}
        </div>
    );
}

export default App;
