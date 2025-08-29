
import React from 'react';
import { Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslations } from '../../hooks/useTranslations';

const TypingIndicator: React.FC = () => {
    const t = useTranslations();
    
    const containerVariants = {
        hidden: { opacity: 0, scale: 0.8, y: 20 },
        visible: {
            opacity: 1,
            scale: 1,
            y: 0,
            transition: {
                type: "spring" as const,
                stiffness: 200,
                damping: 20
            }
        }
    };

    const dotVariants = {
        start: { y: 0 },
        bounce: {
            y: -8,
            transition: {
                duration: 0.4,
                repeat: Infinity,
                repeatType: "reverse" as const,
                ease: "easeInOut" as const
            }
        }
    };

    return (
        <motion.div 
            className="flex items-end gap-2 justify-start"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={containerVariants}
        >
            <motion.div 
                className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-slate-400"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                <Bot size={20} className="text-white" />
            </motion.div>
            <div className="max-w-md lg:max-w-2xl">
                <motion.div 
                    className="px-4 py-3 rounded-2xl bg-slate-200 dark:bg-slate-700 flex items-center space-x-2"
                    animate={{ scale: [1, 1.02, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span className="text-sm text-text-muted-light dark:text-text-muted-dark italic mr-2">{t.sydIsTyping}</span>
                    <motion.div 
                        className="w-2 h-2 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full"
                        variants={dotVariants}
                        initial="start"
                        animate="bounce"
                        transition={{ delay: 0 }}
                    />
                    <motion.div 
                        className="w-2 h-2 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full"
                        variants={dotVariants}
                        initial="start"
                        animate="bounce"
                        transition={{ delay: 0.2 }}
                    />
                    <motion.div 
                        className="w-2 h-2 bg-gradient-to-br from-pink-400 to-red-500 rounded-full"
                        variants={dotVariants}
                        initial="start"
                        animate="bounce"
                        transition={{ delay: 0.4 }}
                    />
                </motion.div>
            </div>
        </motion.div>
    );
};

export default TypingIndicator;
