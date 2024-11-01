import React, { useState } from "react";

interface AddPageProps {
    handleAddFriend: (friendUID: number | undefined) => void;
    setShowmain: (showMain: boolean) => void;
}

const addPage: React.FC<AddPageProps> = ({handleAddFriend, setShowmain}) => {
    const [friendUID, setFriendUID] = useState<number | undefined>();

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleAddFriend(friendUID); 
        setFriendUID(friendUID); 
        setShowmain(true);
    };

    return (
        <div style={{backgroundColor: 'red'}}className="addpage-container">
            <h1>Add a Friend</h1>
            <form onSubmit={handleSubmit}>
                <input 
                    type="text" 
                    id="friendUID"         
                    name="friendUID"        
                    value={friendUID}
                    onChange={(e) => setFriendUID(Number(e.target.value))} 
                    placeholder="Enter friend's UID" 
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
