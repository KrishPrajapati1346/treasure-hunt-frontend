import { motion } from 'framer-motion';
import StarField from '../components/effects/StarField';
import AuroraEffect from '../components/effects/AuroraEffects';

const CompletionScreen = () => {
  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-transparent overflow-hidden">
      <StarField />
      <AuroraEffect />
      
      {/* Celebration particles */}
      {[...Array(150)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          initial={{ opacity: 0, y: 0 }}
          animate={{ 
            opacity: [0, 1, 0],
            y: [0, -Math.random() * 500], 
            x: Math.random() * 10 - 5
          }}
          transition={{ 
            duration: Math.random() * 2 + 1, 
            repeat: Infinity, 
            delay: Math.random() * 5
          }}
          style={{ 
            bottom: '0', 
            left: `${Math.random() * 100}%`,
            backgroundColor: ['#FF9900', '#FF5E5E', '#54E346', '#29CDFF', '#AB7DF6'][Math.floor(Math.random() * 5)]
          }}
        />
      ))}
      
      <motion.div 
        className="max-w-3xl w-full mx-auto p-8 relative z-10 bg-gradient-to-br from-black/70 to-indigo-900/70 backdrop-blur-md rounded-2xl border border-cyan-500/30 shadow-2xl"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="text-center">
          <h2 className="text-5xl font-bold bg-gradient-to-r from-cyan-300 to-indigo-400 bg-clip-text text-transparent mb-6">
            Mission Complete! 🚀
          </h2>
          
          <div className="flex justify-center mb-8 space-x-8">
            <div className="celebration-icon text-6xl">🏆</div>
            <div className="celebration-icon text-6xl" style={{ animationDelay: "0.5s" }}>✨</div>
            <div className="celebration-icon text-6xl" style={{ animationDelay: "1s" }}>🎯</div>
          </div>
          
          <p className="text-xl text-cyan-100 mb-6">
            Congratulations! You've successfully completed all your assigned questions.
          </p>
          
          <motion.div 
            className="p-4 bg-indigo-900/50 rounded-lg border border-indigo-500/30 mb-8"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <p className="text-indigo-200">
              Your answers have been submitted and will be reviewed by our team. Thank you for your participation!
            </p>
          </motion.div>
          
          <motion.button
            className="py-3 px-6 bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full text-white font-semibold shadow-lg hover:shadow-cyan-500/20 transition duration-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.location.href = '/dashboard'}
          >
            Return to Dashboard
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CompletionScreen;