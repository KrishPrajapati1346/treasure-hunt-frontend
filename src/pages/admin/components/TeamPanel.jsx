import { useState, useEffect, useRef } from 'react';
import { getTeams, getTeamAnswers, reviewAnswer } from '../../../services/api';

const TeamPanel = () => {
  const [teams, setTeams] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamAnswers, setTeamAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);
  const pollingIntervalRef = useRef(null);
  const lastFetchTimestampRef = useRef(null);
  
  // Track which answers are being reviewed
  const [reviewingAnswers, setReviewingAnswers] = useState({});

  useEffect(() => {
    // Initial fetch
    fetchTeams();
    
    // Set up polling interval (every 10 seconds)
    pollingIntervalRef.current = setInterval(() => {
      refreshData();
    }, 10000);
    
    // Clean up interval on component unmount
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, []);

  // Effect to refresh team answers when selected team changes
  useEffect(() => {
    if (selectedTeam) {
      fetchTeamAnswers(selectedTeam.username);
    }
  }, [selectedTeam]);

  const refreshData = async () => {
    setRefreshing(true);
    
    // Use the last fetch timestamp for more efficient updates
    // This way we only get data that has changed since the last fetch
    await fetchTeams(false, lastFetchTimestampRef.current);
    
    // Refresh selected team answers if applicable
    if (selectedTeam) {
      await fetchTeamAnswers(selectedTeam.username, false, lastFetchTimestampRef.current);
    }
    
    setRefreshing(false);
    setLastUpdated(new Date());
  };

  const fetchTeams = async (showLoading = true, timestamp = null) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      // Use timestamp to only get data that has changed since last fetch
      const response = await getTeams(timestamp);
      lastFetchTimestampRef.current = response.timestamp;
      
      if (response.success) {
        // If we received a full dataset or we don't have any teams yet
        if (!timestamp || teams.length === 0) {
          setTeams(response.teams);
          
          // Apply current search filter to new data
          const filtered = response.teams.filter(team => 
            team.username.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredTeams(filtered);
        } else if (response.teams.length > 0) {
          // Only update the teams that have changed
          const updatedTeams = [...teams];
          
          response.teams.forEach(updatedTeam => {
            const existingIndex = updatedTeams.findIndex(t => t.id === updatedTeam.id);
            if (existingIndex >= 0) {
              updatedTeams[existingIndex] = updatedTeam;
            } else {
              updatedTeams.push(updatedTeam);
            }
          });
          
          setTeams(updatedTeams);
          
          // Re-apply search filter
          const filtered = updatedTeams.filter(team => 
            team.username.toLowerCase().includes(searchQuery.toLowerCase())
          );
          setFilteredTeams(filtered);
        }
        
        // Update selected team with fresh data if needed
        if (selectedTeam) {
          const updatedSelectedTeam = response.teams.find(team => team.id === selectedTeam.id);
          if (updatedSelectedTeam) {
            setSelectedTeam(updatedSelectedTeam);
          }
        }
        
        setLastUpdated(new Date());
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch teams');
      console.error('Error in fetchTeams:', err);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const fetchTeamAnswers = async (username, showLoading = true, timestamp = null) => {
    try {
      if (showLoading) setLoading(true);
      setError(null);
      
      const response = await getTeamAnswers(username, timestamp);
      
      if (response.success) {
        // Update answers while preserving the reviewing state
        setTeamAnswers(prevAnswers => {
          // Get newly reviewed answers (ones that weren't previously reviewed but now are)
          const newAnswers = response.answers || [];
          
          // Remove from the reviewing state any answers that are now reviewed
          const updatedReviewing = {...reviewingAnswers};
          newAnswers.forEach(answer => {
            if (answer.is_reviewed && updatedReviewing[answer.id]) {
              delete updatedReviewing[answer.id];
            }
          });
          setReviewingAnswers(updatedReviewing);
          
          return newAnswers;
        });
        
        // Update the selected team with the answers count
        if (selectedTeam) {
          setSelectedTeam(prev => ({
            ...prev,
            answers_count: response.answers?.length || 0
          }));
        }
      } else {
        setError(response.message);
        setTeamAnswers([]);
      }
    } catch (err) {
      console.error('Error fetching team answers:', err);
      setError('Failed to fetch team answers');
      setTeamAnswers([]);
    } finally {
      if (showLoading) setLoading(false);
    }
  };

  const formatDateTime = (timestamp) => {
    if (!timestamp) return 'N/A';
    return new Date(timestamp).toLocaleString('en-IN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const handleSearch = (event) => {
    const query = event.target.value.toLowerCase();
    setSearchQuery(query);
    const filtered = teams.filter(team => team.username.toLowerCase().includes(query));
    setFilteredTeams(filtered);
  };

  const getImageUrl = (url) => {
    if (!url) return '';
    const cleanPath = url.startsWith('/') ? url.substring(1) : url;
    const baseUrl = import.meta.env.VITE_API_URL.replace('/api', '').replace(/\/$/, '');
    
    const fullUrl = `${baseUrl}/${cleanPath}`;
    return fullUrl;
  };

  const handleTeamClick = (team) => {
    setSelectedTeam(team);
    fetchTeamAnswers(team.username);
  };

  const handleReview = async (answerId, isAccepted, event) => {
    try {
      event.preventDefault();
      setError(null);
      
      // Set the specific answer to reviewing state
      setReviewingAnswers(prev => ({...prev, [answerId]: true}));
      
      // Optimistically update UI
      setTeamAnswers(prevAnswers => 
        prevAnswers.map(answer => 
          answer.id === answerId 
            ? {
                ...answer,
                is_reviewed: true,
                is_accepted: isAccepted,
                reviewed_at: new Date().toISOString()
              }
            : answer
        )
      );
      
      const response = await reviewAnswer(selectedTeam.username, answerId, isAccepted);
      
      if (response.success) {
        // After successful review, refresh data
        await fetchTeams(false);
      } else {
        setError(response.message || 'Failed to review answer');
        // If error, revert changes by re-fetching
        fetchTeamAnswers(selectedTeam.username, false);
      }
    } catch (err) {
      console.error('Error in handleReview:', err);
      setError('Failed to review answer');
      // Revert changes by re-fetching
      fetchTeamAnswers(selectedTeam.username, false);
    } finally {
      // Always clear the reviewing state for this answer
      setReviewingAnswers(prev => {
        const updated = {...prev};
        delete updated[answerId];
        return updated;
      });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4 lg:p-6">
      {/* Status bar with refresh button and last updated timestamp */}
      <div className="w-full flex justify-between items-center mb-4">
        <div className="flex items-center">
          <button 
            onClick={refreshData} 
            disabled={refreshing} 
            className="flex items-center px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded-md mr-3 disabled:opacity-70"
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
          {lastUpdated && (
            <span className="text-sm text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </span>
          )}
        </div>
        {error && <div className="text-red-500">{error}</div>}
      </div>

      {/* Teams List */}
      <div className="w-full lg:w-1/3 border-b lg:border-b-0 lg:border-r pb-4 lg:pb-0 lg:pr-6">
        <h2 className="text-2xl font-semibold mb-4 text-gray-200">Teams</h2>
        <input
          type="text"
          placeholder="Search teams..."
          value={searchQuery}
          onChange={handleSearch}
          className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
        />
        {loading && teams.length === 0 ? (
          <div className="flex justify-center items-center p-4">
            <div className="animate-pulse text-gray-400">Loading teams...</div>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="text-gray-500">No teams found</div>
        ) : (
          <div className="space-y-2">
            {filteredTeams.map((team) => (
              <button
                key={team.id}
                onClick={() => handleTeamClick(team)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  selectedTeam?.id === team.id
                    ? 'bg-cyan-100 text-gray-900 outline-4 outline-cyan-600'
                    : 'hover:bg-gray-100 text-gray-800'
                }`}
              >
                <div className="font-medium">{team.username}</div>
                <div className="text-sm text-gray-600">
                  Questions Answered: {team.answers_count || 0}
                </div>
              </button>
            ))}
          </div>
        )}
        
        {refreshing && (
          <div className="text-xs text-center text-gray-400 mt-2">
            Refreshing data...
          </div>
        )}
      </div>

      {/* Team Answers */}
      <div className="w-full lg:w-2/3">
        {loading && !selectedTeam ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse text-gray-400">Select a team to view answers</div>
          </div>
        ) : selectedTeam ? (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-gray-300">
              {selectedTeam.username}'s Answers ({teamAnswers.length})
            </h2>
            
            {loading && teamAnswers.length === 0 ? (
              <div className="flex justify-center items-center p-8">
                <div className="animate-pulse text-gray-400">Loading answers...</div>
              </div>
            ) : teamAnswers.length === 0 ? (
              <div className="bg-white p-6 rounded-lg shadow-sm text-gray-500 text-center">
                No answers submitted yet
              </div>
            ) : (
              <div className="space-y-4">
                {teamAnswers.map((answer) => (
                  // Replace the answer card rendering section with this updated version

<div key={answer.id} className="border rounded-lg p-4 bg-white shadow-sm">
  <div className="flex flex-col md:flex-row justify-between items-start gap-4">
    <div className="space-y-2 w-full md:w-3/4">
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-gray-800">
          Question {answer.question_number}
          {answer.is_bonus && ' (Bonus)'}
        </h3>
        <div className="text-sm text-gray-500">
          <div>Submitted: {formatDateTime(answer.submitted_at)}</div>
          {answer.is_reviewed && (
            <div className="mt-1">
              Reviewed: {formatDateTime(answer.reviewed_at)}
            </div>
          )}
        </div>
      </div>
      <p className="text-gray-600">{answer.question_text}</p>
      <p className="text-sm text-blue-600">Points: {answer.points}</p>
      
      {/* Display question image if available */}
      {answer.question_image_url && (
        <div className="mt-2">
          <p className="font-medium text-gray-800 mb-2">Question Image:</p>
          <img
            src={getImageUrl(answer.question_image_url)}
            alt="Question"
            className="w-full max-w-lg rounded-lg shadow-sm object-contain"
            style={{ maxHeight: '300px' }}
            onError={(e) => {
              console.error('Question image load error:', e.target.src);
              e.target.style.display = 'none';
              const errorDiv = document.createElement('div');
              errorDiv.className = 'text-red-500 text-sm mt-2';
              errorDiv.textContent = 'Failed to load question image';
              e.target.parentElement.appendChild(errorDiv);
            }}
          />
        </div>
      )}
      
      <div className="mt-4">
        <p className="font-medium text-gray-800">Answer:</p>
        <p className="mt-1 text-gray-700">{answer.text_answer}</p>
        
        {/* Display answer image if available */}
        {answer.image_answer_url && (
          <div className="mt-2">
            <p className="font-medium text-gray-800 mb-2">Answer Image:</p>
            <img
              src={getImageUrl(answer.image_answer_url)}
              alt="Answer submission"
              className="w-full max-w-lg rounded-lg shadow-sm object-contain"
              style={{ maxHeight: '300px' }}
              onError={(e) => {
                console.error('Answer image load error:', e.target.src);
                e.target.style.display = 'none';
                const errorDiv = document.createElement('div');
                errorDiv.className = 'text-red-500 text-sm mt-2';
                errorDiv.textContent = 'Failed to load answer image';
                e.target.parentElement.appendChild(errorDiv);
              }}
            />
          </div>
        )}
      </div>
    </div>

    <div className="flex flex-row md:flex-col gap-2 w-full md:w-auto">
      {!answer.is_reviewed ? (
        <>
          <button
            onClick={(e) => handleReview(answer.id, true, e)}
            className="flex-1 md:flex-none bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            disabled={reviewingAnswers[answer.id]}
          >
            {reviewingAnswers[answer.id] ? 'Processing...' : 'Accept'}
          </button>
          <button
            onClick={(e) => handleReview(answer.id, false, e)}
            className="flex-1 md:flex-none bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors text-sm md:text-base"
            disabled={reviewingAnswers[answer.id]}
          >
            {reviewingAnswers[answer.id] ? 'Processing...' : 'Reject'}
          </button>
        </>
      ) : (
        <div className={`text-center px-3 py-1 rounded-lg ${
          answer.is_accepted 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {answer.is_accepted ? 'Accepted' : 'Rejected'}
        </div>
      )}
    </div>
  </div>
</div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="flex justify-center items-center h-64 text-gray-500">
            Select a team to view their answers
          </div>
        )}
        
        {refreshing && selectedTeam && (
          <div className="text-center text-gray-400 mt-2">
            Refreshing answers...
          </div>
        )}
      </div>
    </div>
  );
};

export default TeamPanel;