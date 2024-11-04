import React, { useState, useEffect } from "react";
import EditProfile from "./editProfile";

interface User {
  user_id: number;
  username: string;
  bio?: string;
  uid: number;
}

interface sideBarProps {
  user: User | null;
  setSelectedFriend: (selectedFriend: User) => void;
  showMain: boolean;
  setShowmain: (showMain: boolean) => void;
}

const Sidebar: React.FC<sideBarProps> = ({
  user,
  setSelectedFriend,
  setShowmain,
  showMain
}) => {
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [friends, setFriends] = useState<User[]>([]);
  const [showEdit, setShowEdit] = useState<boolean>(false);

  const filteredFriends = searchTerm
    ? friends.filter((friend) =>
        friend.username.toLowerCase().startsWith(searchTerm.toLowerCase())
      )
    : friends;

  const switchEditProfile = async () => {
    setShowEdit(!showEdit);
  }

  const fetchFriends = async () => {
    try {
      const response = await fetch("/api/friends", {
        method: "GET",
        credentials: "include",
      });
      const data: User[] = await response.json();
      setFriends(data);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  const handleShowAddFriend = () => {
    setShowmain(!showMain);
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
        <input
          type="text"
          placeholder="Search friends..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="sidebar-friends-list">
        <ul className="friend-item">
          {filteredFriends.length > 0 ? (
            filteredFriends.map((friend) => (
              <li
                key={friend.user_id}
                onClick={() => setSelectedFriend(friend)}
              >
                {friend.username}
              </li>
            ))
          ) : (
            <li>No friends found</li>
          )}
        </ul>
      </div>
      <button className="edit-profile-button" onClick={switchEditProfile}>Edit Profile</button>
      {showEdit === true ? <EditProfile username={user?.username} bio={user?.bio} uid={user?.uid} switchEditProfile={switchEditProfile}/> : null}
    </div>
  );
};

export default Sidebar;
