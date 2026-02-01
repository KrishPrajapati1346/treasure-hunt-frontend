import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { getCurrentQuestion, submitAnswer } from '../../services/api';
import QuestionDisplay from './components/QuestionDisplay';
import AnswerForm from './components/AnswerForm';
import ErrorAlert from './components/Alert/ErrorAlert';
import SuccessAlert from './components/Alert/SuccessAlert';
import BonusQuestionHandler from './components/BonusQuestionHandler';
import StarField from './components/effects/StarField';
import AuroraEffect from './components/effects/AuroraEffects';
import CompletionScreen from './components/CompletionScreen';
import ProgressBar from './components/ProgressBar';
import './styles/animations.css';

const Participant = () => {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState('');
  const [textAnswer, setTextAnswer] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [totalEstimatedQuestions, setTotalEstimatedQuestions] = useState(5);
  const [isBonusMode, setIsBonusMode] = useState(false);
  const [completedBonus, setCompletedBonus] = useState(0);  // Moved up
  const [bonusCompleted, setBonusCompleted] = useState(false);

  useEffect(() => {
    console.log({
      questionNumber,
      completedBonus,
      isBonusMode
    });
  }, [questionNumber, completedBonus, isBonusMode]);

  useEffect(() => {
    fetchCurrentQuestion(false);
  }, []); 

  const fetchCurrentQuestion = async (isBonus = false) => {
    try {
      setLoading(true);
      setError(null);
      const response = await getCurrentQuestion(isBonus);
      
      if (response.success) {
        if (response.question) {
          setCurrentQuestion({
            id: response.question.id,
            question: response.question.text,
            points: response.question.points,
            requires_image: Boolean(response.question.requires_image),
            image_url: response.question.image_url,
            is_bonus: response.question.is_bonus
          });
        
          setQuestionNumber(response.question_number);
          setTotalEstimatedQuestions(response.total_questions || 75); // Set a default value
          setCompletedBonus(response.completed_bonus || 0);
          setBonusCompleted(false); // Reset bonus completed state
        } else if (response.completed) {
          setCurrentQuestion({ completed: true });
        }
      } else {
        setError(response.message || 'No question available');
      }
    } catch (err) {
      console.error('Error fetching question:', err);
      setError('Failed to fetch question');
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        setError('Image size must be less than 25MB');
        e.target.value = '';
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        e.target.value = '';
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setError(null); // Clear any previous errors
    } else {
      setImage(null);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentQuestion?.id) {
      setError('No question to submit answer for');
      return;
    }

    if (currentQuestion.requires_image && !image) {
      setError('This question requires an image');
      return;
    }

    if (!textAnswer.trim() && !image) {
      setError('Please provide either a text answer or an image');
      return;
    }

    setSubmitting(true);
    setError(null);
    setSuccess('');

    try {
      const formData = new FormData();
      if (textAnswer.trim()) {
        formData.append('text_answer', textAnswer.trim());
      }
      if (image) {
        formData.append('image', image);
      }
  
      const response = await submitAnswer(currentQuestion.id, formData);
      
      if (response.success) {
        if (currentQuestion.is_bonus) {
          setCompletedBonus(prev => prev + 1);
          setBonusCompleted(true);
        }
        setSuccess('Answer submitted successfully!');
        setTextAnswer('');
        setImage(null);
        setImagePreview(null);
        
        setTimeout(() => {
          setSuccess('');
          fetchCurrentQuestion(false);
        }, 1500);
      } else {
        setError(response.message || 'Failed to submit answer');
      }
    } catch (err) {
      console.error('Error submitting answer:', err);
      setError('Failed to submit answer');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSwitchToBonus = async () => {
    setIsBonusMode(true);
    await fetchCurrentQuestion(true);
  };

  const handleSwitchToNormal = async () => {
    setIsBonusMode(false);
    await fetchCurrentQuestion(false);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (currentQuestion?.completed) {
    return <CompletionScreen />;
  }

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden">
      <StarField />
      <AuroraEffect />
      
      <div className="max-w-2xl w-full mx-auto p-6 relative z-10">
        <ProgressBar 
          questionNumber={questionNumber} 
          totalQuestions={totalEstimatedQuestions} 
        />
        
        <h2 className="text-2xl font-bold mb-6 text-cyan-300 text-center animate-pulse">
          Current Question
        </h2>
        
        <BonusQuestionHandler
      questionNumber={questionNumber}
      onSwitchToBonus={handleSwitchToBonus}
      onSwitchToNormal={handleSwitchToNormal}
      isBonusMode={isBonusMode}
      completedBonus={completedBonus}
    />
        
        <QuestionDisplay 
          question={currentQuestion?.question}
          points={currentQuestion?.points}
          requiresImage={currentQuestion?.requires_image}
          imageUrl={currentQuestion?.image_url}
          apiUrl={import.meta.env.VITE_API_URL}
        />
        
        <AnswerForm 
          textAnswer={textAnswer}
          onTextChange={(e) => setTextAnswer(e.target.value)}
          onImageChange={handleImageChange}
          imagePreview={imagePreview}
          requiresImage={currentQuestion?.requires_image}
          submitting={submitting}
          onSubmit={handleSubmit}
        />
        
        <ErrorAlert message={error} />
        <SuccessAlert message={success} />
      </div>
    </div>
  );
};

export default Participant;