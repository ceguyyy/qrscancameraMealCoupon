import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MealCalendar from './MealCalendar';
import QRScanner from './QRScanner';
import './App.css';

function App() {
  useEffect(() => {
    fetch("https://api-officeless-dev.mekari.com/28086/sendProfile")
      .then(res => res.json())
      .catch(err => console.error("Profile API failed", err));
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<MealCalendar />} />
        <Route path="/scan" element={<QRScanner />} />
      </Routes>
    </Router>
  );
}

export default App;
