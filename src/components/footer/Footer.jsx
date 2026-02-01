import React from 'react';

const Footer = () => {
  return (
    <footer className="relative bg-gradient-to-r from-black via-gray-900 to-black text-cyan-400 py-4 md:py-6 px-4 md:px-8 shadow-lg border-t border-cyan-900">
      <div className="max-w-4xl mx-auto">
        {/* Main footer text with glow effect */}
        <div className="relative group text-center mb-2 md:mb-3">
          <h2 className="text-lg md:text-2xl font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-cyan-300 to-cyan-400">
            2025 Treasure Hunt. All rights reserved.
          </h2>
          <div className="absolute -inset-1 bg-cyan-500 opacity-10 group-hover:opacity-20 blur-lg transition-all duration-300"></div>
        </div>

        {/* Subtext with animated gradient */}
        <div className="relative text-center">
          <p className="text-xs md:text-sm text-cyan-300/80 hover:text-cyan-300 transition-colors duration-300 px-2">
            Crafted with curiosity by Team Technical – the masterminds behind your treasure hunt adventure!
          </p>
          <div className="absolute -inset-1 bg-cyan-500 opacity-0 group-hover:opacity-10 blur-lg transition-all duration-300"></div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;