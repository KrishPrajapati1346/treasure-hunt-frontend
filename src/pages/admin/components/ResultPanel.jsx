import { useState, useEffect, useRef } from 'react';
import { getTeamResults } from '../../../services/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const ResultPanel = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollingIntervalRef = useRef(null);

  useEffect(() => {
    // Initial fetch
    fetchResults();
    
    // Set up polling interval (every 15 seconds)
    pollingIntervalRef.current = setInterval(() => {
      refreshData();
    }, 15000);
    
    // Clean up interval on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  const refreshData = async () => {
    setRefreshing(true);
    await fetchResults(false);
    setRefreshing(false);
  };

  const fetchResults = async (showLoading = true) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await getTeamResults();
      
      if (response.success) {
        // Sort results by points (descending) and then by time (ascending)
        const sortedResults = [...response.results].sort((a, b) => {
          // First sort by points (higher points first)
          if (b.total_points !== a.total_points) {
            return b.total_points - a.total_points;
          }
          // If points are equal, sort by time (less time first)
          return (a.total_time || Number.MAX_VALUE) - (b.total_time || Number.MAX_VALUE);
        });
        
        setResults(sortedResults);
        setLastUpdated(new Date());
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch results');
      console.error('Error fetching results:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const formatTime = (minutes) => {
    if (!minutes) return 'N/A';
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    const currentDate = new Date().toLocaleDateString();
    
    // Add title
    doc.setFontSize(18);
    doc.text('Treasure Hunt Results', 14, 22);
    
    // Add date
    doc.setFontSize(12);
    doc.text(`Generated: ${currentDate}`, 14, 30);
    
    // Prepare table data
    const tableData = results.map((result, index) => [
      index + 1,
      result.username,
      result.total_points,
      `${result.normal_solved} + ${result.bonus_solved} bonus`,
      formatTime(result.total_time),
      result.last_submission_time || 'N/A'
    ]);
    
    // Generate table
    autoTable(doc, {
      startY: 35,
      head: [['Rank', 'Team', 'Total Points', 'Questions Solved', 'Total Time', 'Last Submission']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { fontSize: 10 }
    });
    
    // Save PDF
    doc.save('treasure_hunt_results.pdf');
  };

  if (loading && !refreshing) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold text-gray-300">Team Results</h2>
        
        <div className="flex items-center gap-4">
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
          
          <button
            onClick={exportToPDF}
            disabled={results.length === 0}
            className="flex items-center px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-md disabled:opacity-70"
          >
            <svg 
              className="w-4 h-4 mr-1"
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Download Results
          </button>
          
          <button 
            onClick={refreshData} 
            disabled={refreshing} 
            className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md disabled:opacity-70"
          >
            <svg 
              className={`w-4 h-4 mr-1 ${refreshing ? 'animate-spin' : ''}`}
              xmlns="http://www.w3.org/2000/svg" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </button>
        </div>
      </div>
      
      {error && (
        <div className="text-red-500 mb-4">
          Error: {error}
        </div>
      )}
      
      {results.length === 0 ? (
        <div className="text-gray-500 bg-white p-4 rounded-lg shadow">
          No results available. Teams need to submit and get answers approved to appear here.
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Team</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Points</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Questions Solved</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Submission</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {results.map((result, index) => (
                <tr 
                  key={result.username} 
                  className={`${
                    index % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                  } ${
                    index < 3 ? 'font-semibold' : ''
                  } ${
                    index === 0 ? 'bg-yellow-100' : ''
                  }`}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {index + 1}
                    {index === 0 && (
                      <span className="ml-2 text-yellow-600">🏆 Winner</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">{result.username}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">{result.total_points}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {result.normal_solved} + {result.bonus_solved} bonus
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-800">
                    {formatTime(result.total_time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-sm">
                    {result.last_submission_time || 'N/A'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      
      {refreshing && (
        <div className="text-center text-gray-500 mt-2">
          Refreshing data...
        </div>
      )}
    </div>
  );
};

export default ResultPanel;