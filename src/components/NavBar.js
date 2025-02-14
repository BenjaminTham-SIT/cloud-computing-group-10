// src/components/NavBar.js
import React from 'react';
import { Link } from 'react-router-dom';

const NavBar = () => (
  <nav style={{ marginBottom: '20px' }}>
    <button>
      <Link to="/">Forums Home</Link>
    </button>
    {' '}
    <button>
      <Link to="/forum/1">Sample Forum</Link>
    </button>
    {' '}
    <button>
      <Link to="/post/1">Sample Post</Link>
    </button>
  </nav>
);

export default NavBar;
