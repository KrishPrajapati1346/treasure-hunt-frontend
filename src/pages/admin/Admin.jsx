import React, { useState } from 'react';
import QuestionPanel from './components/QuestionPanel';
import TeamPanel from './components/TeamPanel';
import ResultPanel from './components/ResultPanel';
import ViewQuestions from './components/ViewQuestions';

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

const Admin = () => {
  const [activeTab, setActiveTab] = useState('Questions');

  return (
    <div style={{
      position: 'relative',
      width: '100vw',
      maxWidth: '100vw',
      height: 'auto',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: '1rem',
      fontFamily: "'Poppins', sans-serif",
      color: '#fff',
      boxSizing: 'border-box',
      overflowX: 'hidden',
    }}>
    
    
      <style>
        {`
          @keyframes twinkle {
            0%, 100% { opacity: 0.2; }
            50% { opacity: 1; }
          }
        `}
      </style>
      <StarField />
      <div style={{
        background: 'rgba(16, 16, 16, 0.8)',
        backdropFilter: 'blur(10px)',
        borderRadius: '12px',
        boxShadow: '0 0 20px rgba(0,255,255,0.3)',
        padding: '30px',
        width: '100%',
        maxWidth: '800px',
        border: '1px solid rgba(0,255,255,0.1)'
      }}>
        <h1 style={{
          color: '#00ffff',
          fontSize: '28px',
          marginBottom: '20px',
          textAlign: 'center',
          textShadow: '0 0 10px rgba(0,255,255,0.5)'
        }}>
          Admin Dashboard
        </h1>
        
        <div style={{ 
  display: 'flex', 
  justifyContent: 'center', 
  flexWrap: 'wrap', /* Allows buttons to wrap on small screens */
  gap: '10px', 
  marginBottom: '20px',
  width: '100%' 
}}>
  {['Questions', 'View Questions', 'Teams', 'Results'].map((tab) => (
    <button
      key={tab}
      onClick={() => setActiveTab(tab)}
      style={{
        padding: '8px 16px',  // Slightly reduced padding for compact fit
        background: activeTab === tab ? 'rgba(0,255,255,0.9)' : 'rgba(0,255,255,0.1)',
        color: activeTab === tab ? '#000' : '#00ffff',
        border: '1px solid rgba(0,255,255,0.3)',
        borderRadius: '5px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        backdropFilter: 'blur(5px)',
        minWidth: 'auto',
        maxWidth: '150px',  // Limits button width
        whiteSpace: 'nowrap',  // Prevents text breaking into multiple lines
        textAlign: 'center',
      }}
    >
      {tab}
    </button>
  ))}
</div>

        
        <div style={{
          background: 'rgba(10, 10, 10, 0.8)',
          padding: '20px',
          borderRadius: '8px',
          border: '1px solid rgba(0,255,255,0.2)',
          boxShadow: '0 0 15px rgba(0,255,255,0.3)'
        }}>
          {activeTab === 'Questions' && <QuestionPanel />}
          {activeTab === 'View Questions' && <ViewQuestions />}
          {activeTab === 'Teams' && <TeamPanel />}
          {activeTab === 'Results' && <ResultPanel />}
        </div>
      </div>
    </div>
  );
};

export default Admin;
