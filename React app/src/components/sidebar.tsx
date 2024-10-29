import React, { useState, useEffect } from 'react';

interface User {
    user_id: number;
    username: string;
} 

interface sideBarProps{
    user: User | null;
    setSelectedFriend: (selectedFriend: User) => void;
    setShowmain: (showMain: boolean) => void;
}

const Sidebar: React.FC<sideBarProps> = ({ user, setSelectedFriend, setShowmain }) => {
    const [friends, setFriends] = useState<User[]>([]);

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends', {
                method: 'GET',
                credentials: 'include',
            });
            const data: User[] = await response.json();
            setFriends(data);
        } catch (error) {
            console.error('Error fetching friends:', error);
        }
    };

    const handleShowAddFriend = () => {
        setShowmain(false);
    };

    useEffect(() => {
        fetchFriends();
    }, []);

    return (
        <div className="sidebar-container">
            <div className="sidebar-header">
                <h1>Friends List</h1>
                <button onClick={handleShowAddFriend}>Add Friend</button>
            </div>
            <div className="sidebar-search">
                <input type="text" placeholder="Search..." />
            </div>
            <div className="sidebar-friends-list">
                <ul className="friend-item">
                    {friends.length > 0 ? (
                        friends.map((friend) => (
                            <li key={friend.user_id} onClick={() => setSelectedFriend(friend)}>
                                {friend.username}
                            </li>
                        ))
                    ) : (
                        <li>No friends found</li> 
                    )}
                </ul>
            </div>
        </div>
    );
}

export default Sidebar;
