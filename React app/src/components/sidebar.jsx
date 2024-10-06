import React, { useState, useEffect } from 'react';

function Sidebar({ user, setSelectedFriend, setShowmain }) {
    const [friends, setFriends] = useState([]);

    const fetchFriends = async () => {
        try {
            const response = await fetch('/api/friends', {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            setFriends(data);
            console.log(friends);
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
