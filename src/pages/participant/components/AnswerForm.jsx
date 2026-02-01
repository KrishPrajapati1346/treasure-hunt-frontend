import { motion } from 'framer-motion';

const AnswerForm = ({ 
  textAnswer, 
  onTextChange, 
  onImageChange, 
  imagePreview, 
  requiresImage,
  submitting,
  onSubmit 
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-6 mt-6">
      <div className="space-y-3">
        <label className="block text-cyan-200 font-medium">
          Your Answer:
        </label>
        <textarea
          value={textAnswer}
          onChange={onTextChange}
          rows="4"
          className="w-full p-3 bg-gray-900/70 border border-cyan-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-cyan-400 text-white"
          placeholder="Type your answer here..."
        />
      </div>

      <div className="space-y-3">
        <label className="block text-cyan-200 font-medium flex justify-between items-center">
          <span>{requiresImage ? "Image (Required):" : "Image (Optional):"}</span>
          {requiresImage && <span className="text-xs text-cyan-400">* Required for this question</span>}
        </label>
        
        <div className="flex items-center space-x-4">
          <label className="cursor-pointer flex-1">
            <div className="p-4 border-2 border-dashed border-cyan-700 rounded-lg text-center hover:border-cyan-500 transition-colors">
              <div className="text-cyan-500 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-cyan-200 text-sm">Click to capture an image</div>
              <div className="text-gray-500 text-xs mt-1">Max size: 25MB</div>
              <input 
                type="file" 
                accept="image/*" 
                onChange={onImageChange} 
                className="hidden" 
                capture="environment" // This attribute ensures the camera opens up
              />
            </div>
          </label>
          
          {imagePreview && (
            <div className="w-24 h-24 relative overflow-hidden rounded-lg border border-cyan-700">
              <img 
                src={imagePreview} 
                alt="Preview" 
                className="w-full h-full object-cover" 
              />
              <button
                type="button"
                onClick={() => onImageChange({ target: { files: [] } })}
                className="absolute top-1 right-1 bg-red-500 rounded-full p-1 text-white text-xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      <motion.button
        type="submit"
        disabled={submitting}
        className="w-full py-4 rounded-lg font-bold text-lg relative overflow-hidden group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Base background */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 to-indigo-600 opacity-90"></div>
        
        {/* Subtle animated highlight */}
        <div className="absolute inset-0 w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-20 transform -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
        
        {/* Button content */}
        <div className="relative flex items-center justify-center space-x-2">
          {submitting ? (
            <>
              <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Submitting...</span>
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span>Submit Answer</span>
            </>
          )}
        </div>
      </motion.button>
    </form>
  );
};

export default AnswerForm;