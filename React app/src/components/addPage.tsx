import React, { useState } from "react";

interface AddPageProps {
    handleAddFriend: (friendName: string) => void;
}

const addPage: React.FC<AddPageProps> = ({handleAddFriend}) => {
    const [friendName, setFriendName] = useState<string>("");

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleAddFriend(friendName); 
        setFriendName(""); 
    };

    return (
        <div style={{backgroundColor: 'red'}}className="addpage-container">
            <h1>Add a Friend</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    id="friendName"         
                    name="friendName"        
                    value={friendName} 
                    onChange={(e) => setFriendName(e.target.value)} 
                    placeholder="Enter friend's name" 
                />
                <button 
                    type="submit" 
                    id="addFriendButton"    
                    name="addFriendButton"    
                >
                    Add Friend
                </button>
            </form>
        </div>
    );
}

export default addPage;
