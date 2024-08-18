import React from 'react';
import { Link } from 'react-router-dom';
import './css/Home.css';

const Home = () => {
  return (
    <div className="container">
      <h1>Welcome to the Chess Game</h1>
      <p>Challenge yourself with our AI or play against a friend!</p>
      <nav>
        <Link to="/login">Login</Link>
        <Link to="/game">Start Game</Link>
        <Link to="/match">1v1 Match</Link>
      </nav>
    </div>
  );
};

export default Home;
