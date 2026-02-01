import axios from 'axios';

const generateDeviceId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const deviceId = localStorage.getItem('deviceId') || generateDeviceId();
localStorage.setItem('deviceId', deviceId);

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add request interceptor for auth token and debug logging
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  console.log('Request:', { url: config.url, method: config.method });
  return config;
});

// Add response interceptor for debug logging
api.interceptors.response.use(
  (response) => {
    console.log('Response:', { 
      url: response.config.url, 
      status: response.status, 
      data: response.data 
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    return Promise.reject(error);
  }
);

// Add response interceptor for debug logging and session management
api.interceptors.response.use(
  (response) => {
    console.log('Response:', { 
      url: response.config.url, 
      status: response.status, 
      data: response.data 
    });
    return response;
  },
  (error) => {
    console.error('API Error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    // Check if the error is due to an expired session
    if (error.response?.status === 401 && 
        error.response?.data?.sessionExpired) {
      
      // Clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      // Redirect to login page with appropriate message
      if (window.location.pathname !== '/login') {
        window.location.href = '/login?expired=true';
      }
    }
    
    return Promise.reject(error);
  }
);

export const loginUser = async (credentials) => {
  try {
    const response = await api.post('/users/login', {
      ...credentials,
      deviceId
    });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Login failed'
    };
  }
};


export const logoutUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      localStorage.removeItem('user');
      localStorage.removeItem('deviceId');
      return { success: true };
    }

    // Remove /api prefix since it's already in the baseURL
    const response = await api.post('/users/logout', { deviceId });
    
    // Clear all local storage items
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('deviceId');

    return {
      success: true,
      message: response.data?.message || 'Logged out successfully'
    };
  } catch (error) {
    console.error('Logout error:', error);
    // Still remove local storage items even if server request fails
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('deviceId');
    return {
      success: true,
      message: 'Logged out locally'
    };
  }
};


export const registerUser = async (userData) => {
  try {
    const response = await api.post('/users/register', userData);
    return response.data;
  } catch (error) {
    return { 
      success: false, 
      message: error.response?.data?.message || 'Registration failed' 
    };
  }
};

export const createQuestion = async (formData) => {
  try {
    const requires_image = formData.get('requires_image') === 'true';
    const is_bonus = formData.get('is_bonus') === 'true';
    
    formData.set('requires_image', requires_image);
    formData.set('is_bonus', is_bonus);

    const response = await api.post('/questions', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create question'
    };
  }
};
export const getTeamResults = async (lastUpdated = null) => {
  try {
    const params = lastUpdated ? { lastUpdated } : {};
    const response = await api.get('/teams/results', {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.success && response.data.timestamp) {
      localStorage.setItem('lastResultsUpdate', response.data.timestamp);
    }
    
    console.log('Results response:', response.data); // Debug log
    return response.data;
  } catch (error) {
    console.error('Error fetching results:', error);
    return {
      success: false,
      results: [],
      message: error.response?.data?.message || 'Failed to fetch results'
    };
  }
};

export const getAllQuestions = async () => {
  try {
    const response = await api.get('/questions', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch questions'
    };
  }
};

export const createTeam = async (teamData) => {
  try {
    const response = await api.post('/team/create', teamData, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to create team'
    };
  }
};

export const getCurrentQuestion = async (isBonus = false) => {
  try {
    const response = await api.get(`/current-question?is_bonus=${isBonus}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching current question:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch question'
    };
  }
};

export const submitAnswer = async (questionId, formData) => {
  try {
    const response = await api.post(`/submit/${questionId}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'multipart/form-data'
      }
    });
    console.log('Submit response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Submit error:', error.response?.data || error);
    // Handle specific image requirement error
    if (error.response?.status === 400 && 
        error.response?.data?.message?.includes('requires an image')) {
      return {
        success: false,
        message: error.response.data.message,
        requiresImage: true  // Add this flag for frontend handling
      };
    }
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to submit answer'
    };
  }
};

export const getTeams = async (lastUpdated = null) => {
  try {
    const params = lastUpdated ? { lastUpdated } : {};
    const response = await api.get('/teams', {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    if (response.data.success && response.data.timestamp) {
      localStorage.setItem('lastTeamsUpdate', response.data.timestamp);
    }
    
    console.log('Teams API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error.response?.data || error);
    return {
      success: false,
      teams: [],
      message: error.response?.data?.message || 'Failed to fetch teams'
    };
  }
};

export const getTeamAnswers = async (username, lastUpdated = null) => {
  try {
    const params = lastUpdated ? { lastUpdated } : {};
    const response = await api.get(`/teams/${username}/answers`, {
      params,
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.data.success) {
      if (response.data.timestamp) {
        localStorage.setItem(`lastAnswersUpdate_${username}`, response.data.timestamp);
      }
      
      return {
        success: true,
        answers: response.data.answers.map(answer => ({
          ...answer,
          submitted_at: answer.submitted_at ? new Date(answer.submitted_at) : null,
          reviewed_at: answer.reviewed_at ? new Date(answer.reviewed_at) : null
        })),
        timestamp: response.data.timestamp
      };
    } else {
      throw new Error(response.data.message);
    }
  } catch (error) {
    console.error('Error fetching team answers:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to fetch team answers'
    };
  }
};

export const reviewAnswer = async (username, answerId, isAccepted) => {
  try {
    const response = await api.post(
      `/teams/${username}/answers/${answerId}/review`,
      { isAccepted },
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      }
    );
    
    if (response.data.success && response.data.timestamp) {
      localStorage.setItem(`lastReviewUpdate_${username}`, response.data.timestamp);
    }
    
    return response.data;
  } catch (error) {
    console.error('Error reviewing answer:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to review answer'
    };
  }
};

export const updateQuestion = async (id, formData) => {
  try {
    const response = await api.put(`/questions/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to update question'
    };
  }
};

export const deleteQuestion = async (questionId) => {
  try {
    const response = await api.delete(`/questions/${questionId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });
    return response.data;
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || 'Failed to delete question'
    };
  }
};

const handleConfirmDelete = async () => {
  if (!deletingQuestion) return;
  
  console.log('Starting delete operation for question:', deletingQuestion.id);
  setDeleteStatus({ loading: true, message: 'Deleting question...', error: false });
  
  try {
    console.log('Calling API to delete question:', deletingQuestion.id);
    const response = await deleteQuestion(deletingQuestion.id);
    console.log('Delete API response:', response);
    
    if (response.success) {
      console.log('Delete successful, updating UI');
      // Update the local questions state by removing the deleted question
      setQuestions(questions.filter(q => q.id !== deletingQuestion.id));
      
      setDeleteStatus({
        loading: false,
        message: 'Question deleted successfully!',
        error: false
      });
      
      // Close the modal after a short delay
      console.log('Scheduling modal close');
      setTimeout(() => {
        console.log('Closing delete modal');
        setDeletingQuestion(null);
      }, 1500);
    } else {
      console.error('Delete failed:', response.message);
      setDeleteStatus({
        loading: false,
        message: response.message || 'Failed to delete question',
        error: true
      });
    }
  } catch (err) {
    console.error('Error in delete operation:', err);
    setDeleteStatus({
      loading: false,
      message: 'An error occurred while deleting the question',
      error: true
    });
  }
};

const handleSubmit = async (e) => {
  e.preventDefault();
  if (!editingQuestion) return;
  
  console.log('Starting update operation for question:', editingQuestion.id);
  setUpdateStatus({ loading: true, message: 'Updating question...', error: false });
  
  const submitData = new FormData();
  submitData.append('question', formData.question);
  submitData.append('points', formData.points);
  submitData.append('requires_image', formData.requires_image);
  submitData.append('is_bonus', formData.is_bonus);
  submitData.append('remove_image', formData.remove_image);
  
  if (formData.image) {
    submitData.append('image', formData.image);
  }

  try {
    console.log('Calling API to update question:', editingQuestion.id);
    const response = await updateQuestion(editingQuestion.id, submitData);
    console.log('Update API response:', response);
    
    if (response.success) {
      console.log('Update successful, updating UI');
      // Update the local questions state
      setQuestions(questions.map(q => 
        q.id === editingQuestion.id ? response.question : q
      ));
      
      setUpdateStatus({
        loading: false,
        message: 'Question updated successfully!',
        error: false
      });
      
      // Close the modal after a short delay
      console.log('Scheduling modal close');
      setTimeout(() => {
        console.log('Closing edit modal');
        handleCloseModal();
      }, 1500);
    } else {
      console.error('Update failed:', response.message);
      setUpdateStatus({
        loading: false,
        message: response.message || 'Failed to update question',
        error: true
      });
    }
  } catch (err) {
    console.error('Error in update operation:', err);
    setUpdateStatus({
      loading: false,
      message: 'An error occurred while updating the question',
      error: true
    });
  }
};