import { motion } from 'framer-motion';

const AuroraEffect = () => (
  <motion.div 
    className="fixed inset-0 z-[-1] opacity-40 overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 0.4 }}
    transition={{ duration: 1 }}
  >
    <div className="absolute w-[200%] h-[200%] top-[-50%] left-[-50%]" 
      style={{
        background: `
          radial-gradient(circle at center, transparent 0%, #0a0a0a 70%),
          linear-gradient(45deg, rgba(0,255,255,0.1) 0%, transparent 70%),
          linear-gradient(135deg, rgba(0,255,255,0.1) 0%, transparent 70%)
        `,
        animation: 'aurora 15s infinite linear'
      }}
    />
  </motion.div>
);

export default AuroraEffect;