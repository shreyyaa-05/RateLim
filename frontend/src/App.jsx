import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Algorithms from './pages/Algorithms';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-50 text-neutral-800">
      {/* Top Header Navigation */}
      <Navbar />

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Menu */}
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />

        {/* Dynamic Page Content */}
        {currentPage === 'dashboard' ? <Dashboard /> : <Algorithms />}
      </div>
    </div>
  );
}

export default App;
