import { motion } from 'framer-motion';

const StarField = () => (
  <motion.div 
    className="fixed inset-0 z-[-2] overflow-hidden"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    style={{
      background: `
        radial-gradient(circle at center, rgba(0,50,50,0.1) 0%, rgba(10,10,10,1) 100%),
        radial-gradient(circle at 20% 80%, rgba(0,255,255,0.05) 0%, transparent 40%),
        radial-gradient(circle at 80% 20%, rgba(0,255,255,0.05) 0%, transparent 40%),
        #0a0a0a
      `
    }}
  />
);

export default StarField;