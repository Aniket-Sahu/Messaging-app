import React, { useState, useTransition } from "react";

interface editProfileProps {
  username: string | undefined;
  bio: string | undefined;
  uid: number | undefined; 
  switchEditProfile: () => void;
}

const EditProfile: React.FC<editProfileProps> = ({ username, bio, uid, switchEditProfile }) => {
  const [newusername, setNewUsername] = useState<string | undefined>(username);
  const [newBio, setNewBio] = useState<string | undefined>(bio);

  const updateUsername = async (newusername: string | undefined) => {
    if (newusername === undefined || newusername.trim() === "") {
      console.warn("Username cannot be empty");
      return;
    }
    try {
      const response = await fetch(`/api/editUsername/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newusername,
        }),
      });
      console.log("Username successfully updated");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update username: ${errorText}`);
      }
    } catch (error) {
      console.error("Error changing username", error);
    }
  };

  const updateBio = async (newBio: string | undefined) => {
    if (newBio === undefined || newBio.trim() === "") {
      console.warn("bio cannot be empty");
      return;
    }
    try {
      const response = await fetch(`/api/editBio/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          newBio,
        }),
      });
      console.log("Bio successfully updated");
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to update Bio: ${errorText}`);
      }
    } catch (error) {
      console.error("Error changing Bio", error);
    }
  };

  return (
    <div className="edit-profile-container">
      <button className="back-button" onClick={switchEditProfile}>
        Back
      </button>
      <div>
        <h2>Username</h2>
        <input
          type="text"
          id="Username"
          name="Username"
          value={newusername}
          onChange={(e) => setNewUsername(e.target.value)}
          placeholder={username}
        />
        <button onClick={() => updateUsername(newusername)}>Done</button>
      </div>
      <div>
        <h2>Bio</h2>
        <input
          type="text"
          id="Bio"
          name="Bio"
          value={newBio}
          onChange={(e) => setNewBio(e.target.value)}
          placeholder={bio}
        />
        <button onClick={() => updateBio(newBio)}>Done</button>
      </div>
      <div>
        <h3>Your UID is: {uid}</h3>
      </div>
    </div>
  );
};

export default EditProfile;
