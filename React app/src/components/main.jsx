// @ts-nocheck

import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

function Main({ user, selectedFriend, setAuthenticated }) {
    const navigate = useNavigate();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");

    useEffect(() => {
        fetchMessages();
    }, [selectedFriend]);

    const fetchMessages = async () => {
        if (!selectedFriend) return;

        try {
            const response = await fetch(`/api/messages?friendId=${selectedFriend.user_id}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            const sortedMessages = data.messages.sort((a, b) => new Date(a.time) - new Date(b.time));
            setMessages(sortedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const messageSent = async (message) => {
        try {
            const response = await fetch('/api/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message,
                    friendId: selectedFriend.user_id,
                }),
            });
            const data = await response.json();

            if (response.ok) {
                setMessages((prevMessages) => [...prevMessages, data]);
                setNewMessage("");
            }
        } catch (error) {
            console.error('Error sending message', error);
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            messageSent(newMessage);
        }
    };

    const handleLogout = async () => {
        try {
            const response = await fetch('/logout', {
                method: 'GET',
                credentials: 'include',
            });

            if (response.ok) {
                const data = await response.json();
                console.log(data.message); 
                setAuthenticated(false); 
                navigate('/'); 
            } else {
                console.error("Logout failed");
            }
        } catch (error) {
            console.error('Error during logout:', error);
        }
    };

    return (
        <div className="main-container">
            <div className="main-header">
                {selectedFriend ? selectedFriend.username : "Select a friend"}
                <button onClick={handleLogout}>Logout</button>
            </div>
            <div className="main-messages">
                {messages.length > 0 ? messages.map((msg, index) => (
                    <div
                        key={index}
                        className={msg.sender === selectedFriend.name ? "friend-message" : "user-message"}>
                        <span>{msg.message}</span>
                    </div>
                )): <div>You are so lonely</div>}
            </div>
            <div className="main-input">
                <form onSubmit={handleSendMessage}>
                    <input
                        id="message-input"  
                        name="message"   
                        type="text"
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                    />
                    <button type="submit">Send</button>
                </form>
            </div>
        </div>
    );
}

export default Main;
