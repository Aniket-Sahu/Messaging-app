import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';

interface User {
    user_id: number;
    username: string;
} 

interface mainProps{
    user: User;
    selectedFriend: User | null;
    setAuthenticated: (value: boolean) => void;
}

interface Message {
    message_id?: number;
    user_id: number;
    friend_id: number;
    time: Date;
    message: string;
}

const Main: React.FC<mainProps> = ({ user, selectedFriend, setAuthenticated }) => {
    const navigate = useNavigate();
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    useEffect(() => {
        fetchMessages();
    }, [selectedFriend]);

    const fetchMessages = async () => {
        if (!selectedFriend) return;

        try {
            const response = await fetch(`/api/messages?friend_id=${selectedFriend.user_id}`, {
                method: 'GET',
                credentials: 'include',
            });
            const data = await response.json();
            const sortedMessages = data.messages.sort((a: Message, b:Message) => new Date(a.time).getTime() - new Date(b.time).getTime());
            setMessages(sortedMessages);
        } catch (error) {
            console.error('Error fetching messages:', error);
        }
    };

    const messageSent = async (message: string) => {
        if (!selectedFriend) {
            alert("Please select a friend to send a message."); 
            return;
        }
        try {
            const response = await fetch('/api/sendMessage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    message,
                    friend_id: selectedFriend.user_id,
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

    const handleSendMessage = (e: React.FormEvent<HTMLFormElement>) => {
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
                setTimeout(() => {
                    navigate('/'); 
                }, 100);
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
                        className={msg.user_id === user.user_id ? "user-message" : "friend-message" }>
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
