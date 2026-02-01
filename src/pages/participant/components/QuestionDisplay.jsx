import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const QuestionDisplay = ({ question, points, requiresImage, imageUrl, apiUrl }) => {
  console.log('Image URL debug:', { imageUrl, apiUrl }); // Debug log
  const getImageUrl = (url) => {
    if (!url) return '';
    
    // Remove /api/ from the API URL if present
    const baseUrl = apiUrl.replace('/api', '').replace(/\/$/, '');
    // Clean up the image path
    const cleanPath = url.replace(/^\/+/, '');
    
    const fullUrl = `${baseUrl}/${cleanPath}`;
    return fullUrl;
  };

  if (!question) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg shadow-lg p-6 border border-cyan-500"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <p className="text-cyan-300">No question available</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg shadow-lg p-6 mb-6 border border-cyan-500"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.h2 
        className="text-xl font-semibold mb-4 text-cyan-300"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        {question}
      </motion.h2>

      <motion.p 
        className="text-cyan-400 mb-4"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        Points: {points || 0}
      </motion.p>
      
      {requiresImage && (
        <motion.div 
          className="bg-cyan-900/30 border border-cyan-500/50 rounded-lg p-4 mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className="flex items-center">
            <svg 
              className="w-5 h-5 text-cyan-400 mr-2" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
              />
            </svg>
            <p className="text-cyan-300 text-sm font-medium">
              Important: You must submit an image with your answer for this question
            </p>
          </div>
          <p className="text-cyan-400/80 text-xs mt-2 ml-7">
            Accepted formats: JPG, PNG, JPEG (Max size: 25MB)
          </p>
        </motion.div>
      )}

      {imageUrl && (
        <motion.div 
          className="mt-4 border border-cyan-400 rounded-lg p-3"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-sm font-medium text-cyan-300 mb-2">Question Image:</p>
          <img
            src={getImageUrl(imageUrl)}
            alt="Question"
            className="max-w-full h-auto rounded-lg shadow-lg transition-transform transform hover:scale-105"
            onError={(e) => {
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'text-red-500 text-sm mt-2';
              errorDiv.textContent = 'Failed to load image';
              e.target.parentElement.appendChild(errorDiv);
            }}
          />
        </motion.div>
      )}
    </motion.div>
  );
};

QuestionDisplay.propTypes = {
  question: PropTypes.string,
  points: PropTypes.number,
  requiresImage: PropTypes.bool,
  imageUrl: PropTypes.string,
  apiUrl: PropTypes.string.isRequired
};

QuestionDisplay.defaultProps = {
  question: '',
  points: 0,
  requiresImage: false,
  imageUrl: null
};

export default QuestionDisplay;