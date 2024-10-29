import { Link } from 'react-router-dom';
import React from 'react';

const Home: React.FC = () => {
  return (
    <div className='home-container'>
      <h1>Weclome to my Messaging app</h1>
      <div className='home-buttons'>
        <Link to="/login"><button aria-label="Login">Login</button></Link>
        <Link to="/register"><button aria-label="Register">Register</button></Link>
      </div>
    </div>
  );
}

export default Home;

