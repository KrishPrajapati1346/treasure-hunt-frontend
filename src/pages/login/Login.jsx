import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { loginUser, registerUser } from '../../services/api';

// Get event end date from environment variables with a fallback
const EVENT_END_DATE = import.meta.env.VITE_EVENT_END_DATE || '2025-02-28T17:00:00';

const StarField = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: `radial-gradient(circle at center, rgba(0,50,50,0.1) 0%, rgba(10,10,10,1) 100%),
                 radial-gradient(circle at 20% 80%, rgba(0,255,255,0.05) 0%, transparent 40%),
                 radial-gradient(circle at 80% 20%, rgba(0,255,255,0.05) 0%, transparent 40%),
                 #0a0a0a`,
    overflow: 'hidden',
    zIndex: -2
  }}>
    {[...Array(200)].map((_, i) => (
      <div
        key={i}
        style={{
          position: 'absolute',
          width: '2px',
          height: '2px',
          background: '#fff',
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          opacity: Math.random(),
          animation: `twinkle ${2 + Math.random() * 3}s infinite ${Math.random() * 2}s`
        }}
      />
    ))}
  </div>
);

const AuroraEffect = () => (
  <div style={{
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    zIndex: -1,
    opacity: 0.4,
    background: 'transparent',
    overflow: 'hidden'
  }}>
    <div style={{
      position: 'absolute',
      width: '200%',
      height: '200%',
      top: '-50%',
      left: '-50%',
      background: `radial-gradient(circle at center, transparent 0%, #0a0a0a 70%),
                   linear-gradient(45deg, 
                     rgba(0,255,255,0.1) 0%, 
                     transparent 70%),
                   linear-gradient(135deg, 
                     rgba(0,255,255,0.1) 0%, 
                     transparent 70%)`,
      animation: 'aurora 15s infinite linear'
    }} />
  </div>
);

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('participant');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [activeInput, setActiveInput] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  // Real-time check of event status - this is the core function
  // that will be called whenever we need to check if event has ended
  const isEventEnded = () => {
    const currentDate = new Date();
    const eventEndDate = new Date(EVENT_END_DATE);
    return currentDate >= eventEndDate;
  };

  // Check for expired session notification and event status when role changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('expired') === 'true') {
      setError('Your previous session has been logged out because you logged in from another device.');
    } else if (params.get('expired') === 'event') {
      // Only show the event ended message for participants
      if (role === 'participant') {
        setError('The treasure hunt event has ended. Thank you for participating!');
      }
    }
    
    // Check if event has ended when role changes
    checkEventStatus();
  }, [location, role]);

  const checkEventStatus = () => {
    const hasEnded = isEventEnded();
    
    // Only block participants, admins can continue
    if (hasEnded && role === 'participant') {
      setError('The Ambiora Treasure Hunt has ended. Thank you for participating! Please return back to AMPHITHEATRE.');
    } else if (error === 'The Ambiora Treasure Hunt has ended. Thank you for participating!' && role === 'admin') {
      // Clear error message when switching to admin role
      setError('');
    }
    
    return hasEnded;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Check if event has ended right now
    const hasEnded = isEventEnded();
    
    // Block ONLY participants if event has ended - admins can always log in
    if (hasEnded && role === 'participant') {
      setError('The Ambiora Treasure Hunt has ended. Thank you for participating!');
      return;
    }

    // Convert username to lowercase before sending to the API
    const lowercaseUsername = username

    try {
      const response = isLogin 
        ? await loginUser({ username: lowercaseUsername, password })
        : await registerUser({ username: lowercaseUsername, password, role });

      console.log("API Response:", response);

      if (response.success) {
        if (isLogin) {
          // Check AGAIN if event has ended before proceeding (only for participants)
          // This double-check ensures that if the event ends during the API call, we still catch it
          const finalEventCheck = isEventEnded();
          if (finalEventCheck && role === 'participant') {
            setError('The Ambiora Treasure Hunt has ended. Thank you for participating!');
            return;
          }
          
          // If there was a previous session on another device
          if (response.previousSession) {
            setSuccessMessage('Your previous session on another device has been logged out.');
          }
          
          // Always store auth data for admins, only store for participants if event hasn't ended
          const isParticipantAndEnded = role === 'participant' && isEventEnded();
          
          if (!isParticipantAndEnded) {
            // Store authentication data in localStorage
            localStorage.setItem('token', response.token || 'dummy-token');
            localStorage.setItem('userRole', response.user.role);
            
            console.log("User authenticated as:", response.user.role);
            
            const userRole = response.user.role;
            
            // Final check before navigation (only for participants)
            if (userRole === 'participant' && isEventEnded()) {
              setError('The Ambiora Treasure Hunt has ended. Thank you for participating!');
              localStorage.removeItem('token');
              localStorage.removeItem('userRole');
              return;
            }
            
            if (successMessage) {
              setTimeout(() => {
                // One last check before navigating (only for participants)
                if (userRole === 'participant' && isEventEnded()) {
                  setError('The Ambiora Treasure Hunt has ended. Thank you for participating!');
                  localStorage.removeItem('token');
                  localStorage.removeItem('userRole');
                  return;
                }
                // Navigate to appropriate page based on role
                navigate(userRole === 'admin' ? '/admin' : '/participant');
              }, 1500);
            } else {
              // One last check before navigating (only for participants)
              if (userRole === 'participant' && isEventEnded()) {
                setError('The Ambiora Treasure Hunt has ended. Thank you for participating!');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                return;
              }
              // Navigate to appropriate page based on role
              navigate(userRole === 'admin' ? '/admin' : '/participant');
            }
          } else {
            setError('The Ambiora Treasure Hunt has ended. Thank you for participating!');
          }
        } else {
          setIsLogin(true);
          setSuccessMessage('Registration successful! Please login.');
        }
      } else {
        setError(response.message || 'Authentication failed');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError('An error occurred during authentication');
    }
  };

  // Clear event ended error when switching to admin role
  useEffect(() => {
    if (role === 'admin' && error === 'The Ambiora Treasure Hunt has ended. Thank you for participating!') {
      setError('');
    }
  }, [role, error]);

  return (
    <div style={{
      position: 'relative',
      minHeight: '85vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0.5rem',
      fontFamily: "'Poppins', sans-serif",
      color: '#fff'
    }}>
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
          @keyframes aurora {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      
      <StarField />
      <AuroraEffect />

      <div style={{
        background: 'rgba(16, 16, 16, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0,255,255,0.3)',
        padding: '40px',
        width: '100%',
        maxWidth: '450px',
        border: '1px solid rgba(0,255,255,0.1)',
        transition: 'box-shadow 0.3s ease'
      }}>
        <h2 style={{
          color: '#00ffff',
          fontSize: '24px',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0,255,255,0.5)'
        }}>
          {isLogin ? 'Sign in to your account' : 'Create new account'}
        </h2>

        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '10px',
          marginBottom: '20px'
        }}>
          <button
            onClick={() => setRole('participant')}
            style={{
              padding: '10px 20px',
              background: role === 'participant' ? 'rgba(0,255,255,0.9)' : 'rgba(0,255,255,0.1)',
              color: role === 'participant' ? '#000' : '#00ffff',
              border: '1px solid rgba(0,255,255,0.3)',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            type="button"
          >
            Participant
          </button>
          <button
            onClick={() => setRole('admin')}
            style={{
              padding: '10px 20px',
              background: role === 'admin' ? 'rgba(0,255,255,0.9)' : 'rgba(0,255,255,0.1)',
              color: role === 'admin' ? '#000' : '#00ffff',
              border: '1px solid rgba(0,255,255,0.3)',
              borderRadius: '5px',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              backdropFilter: 'blur(5px)'
            }}
            type="button"
          >
            Admin
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div style={{
              color: '#ff4444',
              backgroundColor: 'rgba(255,68,68,0.1)',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              border: '1px solid rgba(255,68,68,0.2)'
            }}>
              {error}
            </div>
          )}

          {successMessage && (
            <div style={{
              color: '#44ff44',
              backgroundColor: 'rgba(68,255,68,0.1)',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '15px',
              border: '1px solid rgba(68,255,68,0.2)'
            }}>
              {successMessage}
            </div>
          )}

          <div style={{ marginBottom: '15px' }}>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,255,255,0.3)',
                borderRadius: '5px',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: activeInput === 'username' ? '0 0 15px rgba(0,255,255,0.3)' : 'none'
              }}
              onFocus={() => setActiveInput('username')}
              onBlur={() => setActiveInput('')}
              placeholder="Username"
            />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px',
                backgroundColor: 'rgba(0,0,0,0.3)',
                border: '1px solid rgba(0,255,255,0.3)',
                borderRadius: '5px',
                color: '#fff',
                outline: 'none',
                transition: 'all 0.3s ease',
                boxShadow: activeInput === 'password' ? '0 0 15px rgba(0,255,255,0.3)' : 'none'
              }}
              onFocus={() => setActiveInput('password')}
              onBlur={() => setActiveInput('')}
              placeholder="Password"
            />
          </div>

          <button
            type="submit"
            style={{
              width: '100%',
              padding: '10px',
              background: 'linear-gradient(45deg, rgba(0,255,255,0.9), rgba(0,200,200,0.9))',
              color: '#000',
              border: 'none',
              borderRadius: '5px',
              fontSize: '16px',
              fontWeight: 'bold',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 0 15px rgba(0,255,255,0.3)'
            }}
          >
            {isLogin ? 'Sign in' : 'Register'}
          </button>

          <div style={{
            textAlign: 'center',
            marginTop: '15px'
          }}>
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              style={{
                background: 'none',
                border: 'none',
                color: '#00ffff',
                cursor: 'pointer',
                fontSize: '14px',
                textShadow: '0 0 5px rgba(0,255,255,0.3)'
              }}
            >
              {isLogin ? 'Need an account? Register' : 'Already have an account? Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;