import { useState, useEffect, useRef } from 'react';
import { getAllQuestions, updateQuestion, deleteQuestion } from '../../../services/api';
import Modal from '../../../components/Modal';

const ViewQuestions = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [deletingQuestion, setDeletingQuestion] = useState(null);
  const [deleteStatus, setDeleteStatus] = useState({ loading: false, message: '', error: false });
  const [formData, setFormData] = useState({
    question: '',
    points: 0,
    requires_image: false,
    is_bonus: false,
    image: null,
    remove_image: false
  });
  const [updateStatus, setUpdateStatus] = useState({ loading: false, message: '', error: false });
  const fileInputRef = useRef(null);
  const apiBaseUrl = import.meta.env.VITE_API_URL.split('/api')[0];

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await getAllQuestions();
      if (response.success) {
        console.log('Fetched questions:', response.questions); 
        setQuestions(response.questions);
      } else {
        setError(response.message);
      }
    } catch (err) {
      setError('Failed to fetch questions');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question) => {
    console.log('Question clicked:', question);
    setEditingQuestion(question);
    setFormData({
      question: question.question,
      points: question.points,
      requires_image: question.requires_image,
      is_bonus: question.is_bonus,
      image: null,
      remove_image: false
    });
    console.log('Edit modal should open now. editingQuestion set to:', question.id);
    setUpdateStatus({ loading: false, message: '', error: false });
  };

  const handleCloseModal = () => {
    setEditingQuestion(null);
  };

  const handleDeleteClick = (e, question) => {
    console.log('Delete button clicked for question:', question.id);
    e.preventDefault();
    e.stopPropagation(); // Prevent opening the edit modal
    setDeletingQuestion(question);
    console.log('Delete modal should open now. deletingQuestion set to:', question.id);
  };

  useEffect(() => {
    console.log('editingQuestion state changed:', editingQuestion?.id || 'null');
  }, [editingQuestion]);
  
  useEffect(() => {
    console.log('deletingQuestion state changed:', deletingQuestion?.id || 'null');
  }, [deletingQuestion]);

  const handleCancelDelete = () => {
    setDeletingQuestion(null);
    setDeleteStatus({ loading: false, message: '', error: false });
  };

  const handleConfirmDelete = async () => {
    if (!deletingQuestion) return;
    
    setDeleteStatus({ loading: true, message: 'Deleting question...', error: false });
    
    try {
      const response = await deleteQuestion(deletingQuestion.id);
      
      if (response.success) {
        // Update the local questions state by removing the deleted question
        setQuestions(questions.filter(q => q.id !== deletingQuestion.id));
        
        setDeleteStatus({
          loading: false,
          message: 'Question deleted successfully!',
          error: false
        });
        
        // Close the modal after a short delay
        setTimeout(() => setDeletingQuestion(null), 1500);
      } else {
        setDeleteStatus({
          loading: false,
          message: response.message || 'Failed to delete question',
          error: true
        });
      }
    } catch (err) {
      setDeleteStatus({
        loading: false,
        message: 'An error occurred while deleting the question',
        error: true
      });
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
      remove_image: false
    });
  };

  const handleRemoveImage = () => {
    setFormData({
      ...formData,
      image: null,
      remove_image: true
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!editingQuestion) return;
    
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
      const response = await updateQuestion(editingQuestion.id, submitData);
      
      if (response.success) {
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
        setTimeout(() => handleCloseModal(), 1500);
      } else {
        setUpdateStatus({
          loading: false,
          message: response.message || 'Failed to update question',
          error: true
        });
      }
    } catch (err) {
      setUpdateStatus({
        loading: false,
        message: 'An error occurred while updating the question',
        error: true
      });
    }
  };

  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <div className="text-center">Loading questions...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold mb-4">All Questions</h2>
      <input
        type="text"
        placeholder="Search questions..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-md mb-4"
      />
      <div className="grid gap-6 md:grid-cols-2">
        {filteredQuestions.map((question) => (
          <div 
            key={question.id} 
            className="bg-gray-50 p-4 rounded-lg shadow cursor-pointer hover:bg-gray-100 transition" 
            onClick={() => handleQuestionClick(question)}
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <p className="text-m text-gray-600">Question: {question.question}</p>
                <p className="text-sm text-gray-600">Points: {question.points}</p>
                <div className="flex space-x-2 text-xs">
                  <span className={`px-2 py-1 rounded ${question.is_bonus ? 'bg-yellow-100 text-yellow-800' : 'bg-blue-100 text-blue-800'}`}>
                    {question.is_bonus ? 'Bonus' : 'Standard'}
                  </span>
                  {question.requires_image && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                      Requires Image
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClick(e, question);
                }}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1 bg-red-50 rounded"
              >
                Delete
              </button>
            </div>
            {question.image_url && (
              <div className="mt-4">
                <img
                  src={`${apiBaseUrl}${question.image_url}`}
                  alt={`Question ${question.id}`}
                  className="max-w-full h-auto rounded"
                  onError={(e) => {
                    console.error('Failed to load image:', question.image_url);
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
      
      {/* Edit Question Modal - Using the new Modal component */}
      <Modal 
        isOpen={!!editingQuestion} 
        onClose={handleCloseModal}
      >
        {editingQuestion && (
          <div className="p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold">Edit Question</h3>
              <button 
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Text
                  </label>
                  <textarea
                    name="question"
                    value={formData.question}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows="3"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Points
                  </label>
                  <input
                    type="number"
                    name="points"
                    value={formData.points}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    min="0"
                    required
                  />
                </div>
                
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center">
                    <input
                      id="requires_image"
                      type="checkbox"
                      name="requires_image"
                      checked={formData.requires_image}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="requires_image" className="ml-2 text-sm text-gray-700">
                      Requires Image Answer
                    </label>
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      id="is_bonus"
                      type="checkbox"
                      name="is_bonus"
                      checked={formData.is_bonus}
                      onChange={handleInputChange}
                      className="h-4 w-4 text-blue-600"
                    />
                    <label htmlFor="is_bonus" className="ml-2 text-sm text-gray-700">
                      Bonus Question
                    </label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Question Image
                  </label>
                  
                  {editingQuestion.image_url && !formData.remove_image && (
                    <div className="mb-3">
                      <img
                        src={`${apiBaseUrl}${editingQuestion.image_url}`}
                        alt="Current question image"
                        className="max-h-40 rounded mb-2"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveImage}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Remove image
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="w-full text-sm text-gray-500"
                    ref={fileInputRef}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Upload a new image to replace the current one
                  </p>
                </div>
              </div>
              
              {updateStatus.message && (
                <div className={`mt-4 p-3 rounded ${updateStatus.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                  {updateStatus.message}
                </div>
              )}
              
              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatus.loading}
                  className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
                >
                  {updateStatus.loading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        )}
      </Modal>
      
      {/* Delete Confirmation Modal - Using the new Modal component */}
      <Modal 
        isOpen={!!deletingQuestion} 
        onClose={handleCancelDelete}
      >
        {deletingQuestion && (
          <div className="p-6">
            <h3 className="text-xl font-bold mb-4">Delete Question</h3>
            <p className="mb-6">
              Are you sure you want to delete this question? This action cannot be undone.
            </p>
            <p className="text-gray-700 p-3 bg-gray-50 rounded mb-6 italic">
              "{deletingQuestion.question}"
            </p>
            
            {deleteStatus.message && (
              <div className={`mb-6 p-3 rounded ${deleteStatus.error ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                {deleteStatus.message}
              </div>
            )}
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={deleteStatus.loading}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleteStatus.loading}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:bg-red-300"
              >
                {deleteStatus.loading ? 'Deleting...' : 'Delete Question'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ViewQuestions;
