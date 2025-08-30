import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  className?: string;
  variant?: 'text' | 'card' | 'circle' | 'rectangle';
  width?: string | number;
  height?: string | number;
  count?: number;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  className = '',
  variant = 'text',
  width = '100%',
  height = 'auto',
  count = 1
}) => {
  const getVariantClasses = () => {
    switch (variant) {
      case 'text':
        return 'h-4 rounded-md';
      case 'card':
        return 'h-32 rounded-xl';
      case 'circle':
        return 'rounded-full';
      case 'rectangle':
        return 'rounded-lg';
      default:
        return 'rounded-md';
    }
  };

  const shimmerAnimation = {
    initial: { x: -1000 },
    animate: { 
      x: 1000,
      transition: {
        repeat: Infinity,
        duration: 2,
        ease: "linear" as const
      }
    }
  };

  const items = Array.from({ length: count }, (_, i) => i);

  return (
    <div className={`space-y-3 ${className}`}>
      {items.map((index) => (
        <div
          key={index}
          className={`relative overflow-hidden bg-slate-200 dark:bg-slate-700 ${getVariantClasses()}`}
          style={{ width, height: height === 'auto' ? undefined : height }}
        >
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent"
            initial="initial"
            animate="animate"
            variants={shimmerAnimation}
            style={{ width: '200%' }}
          />
        </div>
      ))}
    </div>
  );
};

export const ATECOSkeletonLoader: React.FC = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900 rounded-2xl p-6 shadow-xl space-y-6"
    >
      {/* Header skeleton */}
      <div className="flex items-center gap-3">
        <SkeletonLoader variant="circle" width={40} height={40} />
        <div className="flex-1">
          <SkeletonLoader width="30%" height={20} />
          <SkeletonLoader width="50%" height={16} className="mt-2" />
        </div>
      </div>

      {/* Content sections skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((section) => (
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: section * 0.1 }}
            className="bg-white/50 dark:bg-slate-800/50 rounded-xl p-4 space-y-3"
          >
            <SkeletonLoader width="40%" height={18} />
            <SkeletonLoader count={3} />
            <SkeletonLoader width="70%" />
          </motion.div>
        ))}
      </div>

      {/* Footer skeleton */}
      <div className="flex gap-3">
        <SkeletonLoader variant="rectangle" width="48%" height={40} />
        <SkeletonLoader variant="rectangle" width="48%" height={40} />
      </div>
    </motion.div>
  );
};

export default SkeletonLoader;