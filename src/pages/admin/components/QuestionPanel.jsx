import { useState } from 'react';
import { createQuestion } from '../../../services/api';

const QuestionPanel = () => {
  const [formData, setFormData] = useState({
    question: '',
    points: '',
    requires_image: false,
    is_bonus: false
  });
  const [image, setImage] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.question || !formData.points) {
      setError('Question text and points are required');
      return;
    }

    const submitData = new FormData();
    submitData.append('question', formData.question);
    submitData.append('points', formData.points);
    submitData.append('requires_image', formData.requires_image);
    submitData.append('is_bonus', formData.is_bonus);
    if (image) {
      submitData.append('image', image);
    }

    try {
      const response = await createQuestion(submitData);
      if (response.success) {
        setSuccess('Question created successfully!');
        setFormData({ 
          question: '', 
          points: '', 
          requires_image: false, 
          is_bonus: false 
        });
        setImage(null);
        setPreview(null);
      } else {
        setError(response.message || 'Failed to create question');
      }
    } catch (err) {
      setError('An error occurred while creating the question');
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6">Create New Question</h2>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6" encType="multipart/form-data">
        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Question Text *
          </label>
          <textarea
            value={formData.question}
            onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows="4"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-100 mb-2">
            Points *
          </label>
          <input
            type="number"
            value={formData.points}
            onChange={(e) => setFormData(prev => ({ ...prev, points: e.target.value }))}
            required
            min="1"
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex space-x-6">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="requires_image"
              checked={formData.requires_image}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                requires_image: e.target.checked 
              }))}
              className="w-4 h-4 text-cyan-600 border-gray-300 rounded focus:ring-cyan-500"
            />
            <label htmlFor="requires_image" className="ml-2 block text-sm text-gray-100">
              Requires Image
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_bonus"
              checked={formData.is_bonus}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                is_bonus: e.target.checked 
              }))}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_bonus" className="ml-2 block text-sm text-gray-100">
              Bonus Question
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2.5">
            Image (Optional)
          </label>
          <input
            type="file"
            onChange={handleImageChange}
            accept="image/*"
            className="w-full p-1.5 text-gray-100 mb-5 border border-gray-300 rounded-md"
          />
          {preview && (
            <div className="mt-2">
              <img src={preview} alt="Preview" className="max-w-xs rounded" />
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-gradient-to-r from-cyan-500 to-cyan-600 text-white py-2 px-4 rounded-md hover:from-cyan-600 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-gray-900">
          Create Question
        </button>
      </form>
    </div>
  );
};

export default QuestionPanel;