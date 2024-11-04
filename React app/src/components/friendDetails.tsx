import React, { useState, useEffect } from "react";

interface FriendDetailsProps {
  friendId: number;
}

interface Details {
  username: string;
  bio: string;
}

const FriendDetails: React.FC<FriendDetailsProps> = ({ friendId }) => {
  const [details, setDetails] = useState<Details | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const getDetails = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/getDetails/${friendId}`, {
        method: "GET",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch friend details");
      }
      const data: { details: Details } = await response.json();
      setDetails(data.details);
    } catch (error) {
      setError("Error fetching details");
      console.error("Error fetching details:", error);
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async () =>{
    try {
      const response = await fetch(`/api/removeFriend/${friendId}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!response.ok) {
        throw new Error("Failed to remove friend");
      }
    } catch (error) {
      console.error("Error removing friend");
    }
  }

  useEffect(() => {
    getDetails();
  }, [friendId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="friend-details">
      {details ? (
        <>
          <small>Username:</small>
          <div>{details.username}</div>
          <small>Bio:</small>
          <div>{details.bio}</div>
          <button onClick={removeFriend}>Remove friend</button>
        </>
      ) : (
        <div>No details available</div>
      )}
    </div>
  );
  
};

export default FriendDetails;
