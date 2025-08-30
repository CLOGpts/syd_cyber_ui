import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedTypingProps {
  text: string;
  speed?: number;
  className?: string;
  onComplete?: () => void;
  cursor?: boolean;
}

const AnimatedTyping: React.FC<AnimatedTypingProps> = ({
  text,
  speed = 30,
  className = '',
  onComplete,
  cursor = true
}) => {
  const [displayedText, setDisplayedText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showCursor, setShowCursor] = useState(true);

  useEffect(() => {
    if (currentIndex < text.length) {
      const char = text[currentIndex];
      
      // Variable speed based on character type
      let delay = speed;
      if (char === '.' || char === '!' || char === '?') {
        delay = speed * 8; // Longer pause at sentence end
      } else if (char === ',' || char === ';' || char === ':') {
        delay = speed * 4; // Medium pause at punctuation
      } else if (char === ' ') {
        delay = speed * 1.5; // Slight pause at spaces
      } else {
        // Random variation for more natural typing
        delay = speed + (Math.random() * speed * 0.5 - speed * 0.25);
      }

      const timeout = setTimeout(() => {
        setDisplayedText(prev => prev + char);
        setCurrentIndex(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timeout);
    } else if (onComplete) {
      onComplete();
    }
  }, [currentIndex, text, speed, onComplete]);

  // Cursor blinking animation
  useEffect(() => {
    if (cursor) {
      const interval = setInterval(() => {
        setShowCursor(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    }
  }, [cursor]);

  return (
    <div className={`inline-block ${className}`}>
      <span>{displayedText}</span>
      {cursor && currentIndex < text.length && (
        <motion.span
          animate={{ opacity: showCursor ? 1 : 0 }}
          transition={{ duration: 0.1 }}
          className="inline-block w-0.5 h-5 bg-blue-500 ml-0.5 align-middle"
        />
      )}
    </div>
  );
};

export default AnimatedTyping;