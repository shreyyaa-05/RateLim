import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import Algorithms from './pages/Algorithms';

export default function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Navbar />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar currentPage={currentPage} setCurrentPage={setCurrentPage} />
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'algorithms' && <Algorithms />}
      </div>
    </div>
  );
}