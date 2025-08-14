// src/Layout.jsx
import React from 'react';
import './styles.css'; 
import Navbar from './sections/navbar';
import Footer from './sections/Footer';
import { BrowserRouter } from 'react-router-dom';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen text-gray-100 font-sans antialiased flex flex-col justify-center p-4 relative overflow-hidden">
      {/* Global Background */}
      <div className="background" />
      {/* Overlay */}
      <div className="background-overlay" />

      {children}

    </div>
  );
};

export default Layout;
