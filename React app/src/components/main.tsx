import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FriendDetails from "./friendDetails";

interface User {
  user_id: number;
  username: string;
}

interface mainProps {
  user: User;
  selectedFriend: User | null;
  setAuthenticated: (value: boolean) => void;
  friendReqs: friendReq[];
}

interface friendReq {
  req_id?: number;
  username: string;
  user_id: number;
  friend_id: number;
  status: "pending" | "accepted" | "rejected";
  timestamp: Date;
}

interface Message {
  message_id?: number;
  user_id: number;
  friend_id: number;
  time: Date;
  message: string;
}

const Main: React.FC<mainProps> = ({
  user,
  selectedFriend,
  setAuthenticated,
  friendReqs,
}) => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>("");
  const [showMenu, setShowMenu] = useState<number | null>(null);
  const [showFriendDetails, setShowFriendDetails] = useState<boolean>(false);
  const [editedMessage, setEditedMessage] = useState<string>("");
  const [showFriendReqs, setShowFriendReqs] = useState<boolean>(false);
  const [editing, setEditing] = useState<{
    isEditing: boolean;
    index: number | null;
  }>({ isEditing: false, index: null });

  const handleMenuToggle = (index: number): void => {
    setShowMenu(showMenu === index ? null : index);
  };

  const handleDelete = async (messageId: number): Promise<void> => {
    console.log(user.user_id);
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (response.ok) {
        setMessages((prevMessages) =>
          prevMessages.filter((message) => message.message_id !== messageId)
        );
      } else {
        console.error("Failed to delete message:", await response.json());
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const handleEdit = async (): Promise<void> => {
    if (editing.index === null) return;

    try {
      const messageId = messages[editing.index].message_id;
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          editedMessage,
        }),
      });
      if (response.ok) {
        const updatedMessage: Message = await response.json();
        setMessages((prevMessages) =>
          prevMessages.map((msg) =>
            msg.message_id === messageId ? updatedMessage : msg
          )
        );
        setNewMessage("");
        setEditing({ isEditing: false, index: null });
        setEditedMessage("");
      }
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  useEffect(() => {
    if (selectedFriend) {
      fetchMessages();
      setShowFriendDetails(false);
    }
  }, [selectedFriend]);

  const detailsManage = async () => {
    setShowFriendDetails(!showFriendDetails);
  };

  const fetchMessages = async () => {
    if (!selectedFriend) return;

    try {
      const response = await fetch(
        `/api/messages?friend_id=${selectedFriend.user_id}`,
        {
          method: "GET",
          credentials: "include",
        }
      );
      const data = await response.json();
      const sortedMessages = data.messages.sort(
        (a: Message, b: Message) =>
          new Date(a.time).getTime() - new Date(b.time).getTime()
      );
      setMessages(sortedMessages);
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const messageSent = async (message: string) => {
    if (!selectedFriend) {
      alert("Please select a friend to send a message.");
      return;
    }
    try {
      const response = await fetch("/api/sendMessage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
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
      console.error("Error sending message", error);
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
      const response = await fetch("/logout", {
        method: "GET",
        credentials: "include",
      });

      if (response.ok) {
        const data = await response.json();
        setAuthenticated(false);
        navigate(data);
      } else {
        const errorData = await response.json();
        console.error("Logout failed:", errorData.message);
      }
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  const toggleDropdown = async () => {
    setShowFriendReqs(!showFriendReqs);
  };

  const acceptReq = async (id: number | undefined) => {
    if (id === undefined) {
      console.warn("The friend req is invalid");
    }
    setShowFriendReqs(false);
    try {
      const response = await fetch(`/api/acceptRequest/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

    } catch (error) {
      console.error("Error accepting friend request", error);
    }
  };

  const rejectReq = async (id: number | undefined) => {
    if (id === undefined) {
      console.warn("The friend req is invalid");
    }
    setShowFriendReqs(false);
    try {
      const response = await fetch(`/api/rejectRequest/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      });

    } catch (error) {
      console.error("Error rejecting friend request", error);
    }
  };

  return (
    <div className="main-container">
      <div className="main-header">
        {selectedFriend ? (
          <span onClick={() => detailsManage()}>{selectedFriend.username}</span>
        ) : (
          <span>Select a friend</span>
        )}
        <div className="friend-requests-container">
          <button onClick={toggleDropdown}>Friend Requests</button>
          {showFriendReqs && (
            <div className="dropdown-menu">
              {friendReqs.length > 0 ? (
                friendReqs.map((req) => (
                  <div key={req.req_id} className="dropdown-item">
                    <p>{`${req.username} sent you a Friend Request`}</p>
                    <button onClick={() => acceptReq(req.req_id)}>
                      Accept
                    </button>
                    <button onClick={() => rejectReq(req.req_id)}>
                      Reject
                    </button>
                  </div>
                ))
              ) : (
                <p>No friend requests</p>
              )}
            </div>
          )}
        </div>
        <button onClick={handleLogout}>Logout</button>
      </div>
      {showFriendDetails && selectedFriend && (
        <FriendDetails friendId={selectedFriend.user_id} />
      )}
      <div className="main-messages">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={
                msg.user_id === user.user_id ? "friend-message" : "user-message"
              }
            >
              <span>{msg.message}</span>

              <div
                className="menu-dots"
                onClick={() => handleMenuToggle(index)}
              >
                &#x22EE;
              </div>

              {showMenu === index && (
                <div className="dropdown-menu">
                  <button
                    onClick={() => {
                      setEditing({ isEditing: true, index });
                      setEditedMessage(msg.message);
                      setShowMenu(null);
                    }}
                  >
                    Edit
                  </button>
                  <button onClick={() => handleDelete(msg.message_id!)}>
                    Delete
                  </button>
                </div>
              )}
            </div>
          ))
        ) : (
          <div>You are so lonely</div>
        )}
      </div>
      <div className="main-input">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (editing.isEditing) {
              handleEdit();
            } else {
              handleSendMessage(e);
            }
          }}
        >
          <input
            id="message-input"
            name="message"
            type="text"
            placeholder="Type your message..."
            value={editing.isEditing ? editedMessage : newMessage}
            onChange={(e) => {
              if (editing.isEditing) {
                setEditedMessage(e.target.value);
              } else {
                setNewMessage(e.target.value);
              }
            }}
          />
          <button type="submit">{editing.isEditing ? "Save" : "Send"}</button>
        </form>
      </div>
    </div>
  );
};

export default Main;
