import React from 'react';

export const ErrorAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
      {message}
    </div>
  );
};

export const SuccessAlert = ({ message }) => {
  if (!message) return null;
  return (
    <div className="bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg">
      {message}
    </div>
  );
};

export default ErrorAlert;