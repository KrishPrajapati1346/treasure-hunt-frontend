import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { logoutUser } from '../../services/api';

const EVENT_END_DATE = import.meta.env.VITE_EVENT_END_DATE || '2025-02-28T17:00:00';

const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [isExpired, setIsExpired] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const navigate = useNavigate();
  const longPressTimer = useRef(null);
  const userExpiredCheckInterval = useRef(null);
  
  // Check if user is admin
  const isAdmin = () => localStorage.getItem('userRole') === 'admin';

  // Direct check if event has ended
  const isEventEnded = () => {
    const currentDate = new Date();
    const eventEndDate = new Date(EVENT_END_DATE);
    return currentDate >= eventEndDate;
  };

  useEffect(() => {
    const targetDate = new Date(EVENT_END_DATE);
    
    // Check if event has already ended on component mount
    if (isEventEnded()) {
      setIsExpired(true);
      handleExpiration();
      return;
    }

    const calculateTimeLeft = () => {
      const now = new Date();
      const difference = targetDate - now;

      if (difference <= 0) {
        setIsExpired(true);
        handleExpiration();
        return { days: 0, hours: 0, minutes: 0, seconds: 0 };
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      return { days, hours, minutes, seconds };
    };

    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    
    // For participants, continuously check if the event has ended
    // This ensures we catch event end even if clock is manipulated
    if (!isAdmin()) {
      userExpiredCheckInterval.current = setInterval(() => {
        if (isEventEnded()) {
          setIsExpired(true);
          handleExpiration();
        }
      }, 10000); // Check every 10 seconds for safety
    }

    return () => {
      clearInterval(timer);
      if (userExpiredCheckInterval.current) {
        clearInterval(userExpiredCheckInterval.current);
      }
    };
  }, []);

  const handleExpiration = async () => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (token && userRole === 'participant') {
      try {
        await logoutUser();
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login?expired=event');
      } catch (error) {
        console.error('Error during automatic logout:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('userRole');
        navigate('/login?expired=event');
      }
    }
  };

  const handleResetTimer = () => {
    // This doesn't actually change the event end time,
    // it just refreshes the timer display
    window.location.reload();
  };

  const handleLongPress = () => {
    if (isAdmin()) {
      setShowReset(prev => !prev);
    }
  };

  // Improved touch handlers for better mobile experience
  const handleTouchStart = () => {
    longPressTimer.current = setTimeout(() => {
      handleLongPress();
    }, 1500);
  };

  const handleTouchEnd = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  // Normal click handler for non-touch devices
  const handleClick = () => {
    if (isAdmin()) {
      const clicks = parseInt(localStorage.getItem('adminClicks') || '0');
      localStorage.setItem('adminClicks', (clicks + 1).toString());
      
      if (clicks >= 4) {
        setShowReset(prev => !prev);
        localStorage.setItem('adminClicks', '0');
      }
    }
  };

  return (
    <div className="flex flex-col justify-center items-center mt-1">
      {showReset && (
        <div className="mb-2 flex flex-col items-center">
          <button 
            onClick={handleResetTimer}
            className="mb-2 bg-red-600 hover:bg-red-700 text-white text-xs px-2 py-1 rounded"
          >
            Refresh Timer
          </button>
          <div className="text-xs text-cyan-600">
            (Admin only)
          </div>
        </div>
      )}
      
      <div 
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        onClick={handleClick}
        className="cursor-pointer select-none"
      >
        {isExpired ? (
          <div className="text-red-400 font-semibold animate-pulse">
            Event Ended
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 text-cyan-400 rounded px-2 py-1">
                <span className="font-mono font-bold">{timeLeft.days.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-xs text-cyan-300 mt-0.5">days</span>
            </div>
            <span className="text-cyan-400 font-bold">:</span>
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 text-cyan-400 rounded px-2 py-1">
                <span className="font-mono font-bold">{timeLeft.hours.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-xs text-cyan-300 mt-0.5">hrs</span>
            </div>
            <span className="text-cyan-400 font-bold">:</span>
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 text-cyan-400 rounded px-2 py-1">
                <span className="font-mono font-bold">{timeLeft.minutes.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-xs text-cyan-300 mt-0.5">min</span>
            </div>
            <span className="text-cyan-400 font-bold">:</span>
            <div className="flex flex-col items-center">
              <div className="bg-gray-800 text-cyan-400 rounded px-2 py-1">
                <span className="font-mono font-bold">{timeLeft.seconds.toString().padStart(2, '0')}</span>
              </div>
              <span className="text-xs text-cyan-300 mt-0.5">sec</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CountdownTimer;