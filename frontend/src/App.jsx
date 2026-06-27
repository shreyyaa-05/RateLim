import React from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import './App.css';

function App() {
  return (
    <div className="flex h-screen w-screen flex-col overflow-hidden bg-neutral-50 text-neutral-800">
      {/* Top Header Navigation */}
      <Navbar />

      {/* Main Body Layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Side Menu */}
        <Sidebar />

        {/* Dashboard Content page */}
        <Dashboard />
      </div>
    </div>
  );
}

export default App;
