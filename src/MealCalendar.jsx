import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const API_URL = "https://api-officeless-dev.mekari.com/28086/getMenuForCalendar";

const MealCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [menuData, setMenuData] = useState({});
  const [loading, setLoading] = useState(true);

  // Fetch Data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(API_URL);
        const data = await res.json();

        // Group by Date String (YYYY-MM-DD)
        const grouped = {};
        data.forEach(item => {
          let dateStr = "";
          if (typeof item.menu_date === 'number') {
            dateStr = new Date(item.menu_date).toLocaleDateString('en-CA');
          } else if (item.menu_date) {
            dateStr = item.menu_date.split("T")[0];
          }
          if (dateStr) grouped[dateStr] = item;
        });

        setMenuData(grouped);
      } catch (err) {
        console.error("Failed to fetch menu", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Calendar Logic
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const todayStr = new Date().toLocaleDateString('en-CA');

  const daysInMonth = Array.from({ length: lastDay.getDate() }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: firstDay.getDay() }, (_, i) => i);

  const changeMonth = (delta) => {
    setCurrentDate(new Date(year, month + delta, 1));
  };

  return (
    <div className="wrapper">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
          {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
        </h1>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="icon-btn" onClick={() => changeMonth(-1)}>←</button>
          <button className="icon-btn" onClick={() => changeMonth(1)}>→</button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="calendar-container">
        {/* Weekday Headers (Desktop Only) */}
        <div className="weekdays">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="day-name">{d}</div>
          ))}
        </div>

        {/* Days Grid */}
        <div className="calendar-grid">
          {/* Empty Cells for alignment */}
          {emptyDays.map(i => <div key={`empty-${i}`} className="empty-cell" />)}

          {/* Actual Days */}
          {daysInMonth.map(d => {
            const loopDate = new Date(year, month, d);
            const dateKey = loopDate.toLocaleDateString('en-CA');
            const dayName = loopDate.toLocaleString('default', { weekday: 'short' });
            const item = menuData[dateKey];
            const isToday = dateKey === todayStr;

            return (
              <div key={d} className={`day-cell ${isToday ? 'today' : ''}`}>
                <div className="day-header">
                  <span className="mobile-day">{dayName}</span>
                  <div className="date-number">{d}</div>
                </div>

                {item && (
                  <div style={{ opacity: item.is_published ? 1 : 0.6 }}>
                    {!item.is_published && <div className="draft-badge">DRAFT</div>}

                    <div className="vendor-label">
                      {item.vendor_id?.name || "Vendor"}
                    </div>

                    {item.menu_detail.map((m, idx) => (
                      <div key={idx} className="menu-pill">
                        {m.menu}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .calendar-container {
          background: var(--bg-card);
          border-radius: var(--radius);
          box-shadow: var(--shadow);
          border: 1px solid var(--separator);
          overflow: hidden;
        }
        .weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          border-bottom: 1px solid var(--separator);
          background: var(--bg-card);
        }
        .day-name { padding: 12px 0; text-align: center; font-size: 11px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; }
        
        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          background: var(--separator);
          gap: 1px;
        }
        .day-cell {
          background: var(--bg-card);
          min-height: 120px;
          padding: 8px;
          display: flex;
          flex-direction: column;
        }
        .empty-cell { background: var(--bg-card); }
        
        .day-header { display: flex; justify-content: flex-end; margin-bottom: 6px; }
        .date-number { font-size: 15px; font-weight: 500; width: 28px; height: 28px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
        .today .date-number { background: var(--danger); color: white; font-weight: 600; }
        
        .vendor-label { font-size: 10px; font-weight: 700; color: var(--text-secondary); text-transform: uppercase; margin-bottom: 4px; }
        .menu-pill { font-size: 11px; background: var(--accent-light); color: var(--accent); padding: 4px 6px; border-radius: 4px; margin-bottom: 2px; font-weight: 500; }
        .draft-badge { display: inline-block; font-size: 9px; background: var(--warning); color: white; padding: 2px 4px; border-radius: 4px; font-weight: 700; margin-bottom: 4px; }
        
        .mobile-day { display: none; }

        @media (max-width: 768px) {
          .weekdays, .empty-cell { display: none; }
          .calendar-grid { display: flex; flex-direction: column; background: transparent; gap: 12px; }
          .day-cell { border-radius: 12px; min-height: auto; border: 1px solid var(--separator); padding: 12px; }
          .day-header { justify-content: flex-start; align-items: center; gap: 8px; border-bottom: 1px solid var(--separator); padding-bottom: 8px; margin-bottom: 8px; }
          .mobile-day { display: block; font-size: 14px; font-weight: 600; color: var(--text-secondary); margin-right: auto; }
        }
      `}</style>
    </div>
  );
};

export default MealCalendar;
