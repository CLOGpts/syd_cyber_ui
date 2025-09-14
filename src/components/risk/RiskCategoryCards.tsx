import React from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Monitor, 
  Users, 
  Settings, 
  UserCheck, 
  ShieldAlert, 
  AlertTriangle 
} from 'lucide-react';

interface RiskCategory {
  id: string;
  name: string;
  icon: React.ReactNode;
  count: number;
  description: string;
  gradient: string;
  shadowColor: string;
}

interface RiskCategoryCardsProps {
  onCategorySelect: (categoryId: string) => void;
  isDarkMode?: boolean;
}

const RiskCategoryCards: React.FC<RiskCategoryCardsProps> = ({ 
  onCategorySelect, 
  isDarkMode = false 
}) => {
  const categories: RiskCategory[] = [
    {
      id: 'danni',
      name: 'DANNI FISICI',
      icon: <Flame className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 10,
      description: 'Disastri naturali, incendi, furti',
      gradient: 'from-sky-500 to-blue-600',
      shadowColor: 'rgba(14, 165, 233, 0.3)'
    },
    {
      id: 'sistemi',
      name: 'SISTEMI & IT',
      icon: <Monitor className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 20,
      description: 'Cyber attack, downtime, data breach',
      gradient: 'from-blue-500 to-indigo-600',
      shadowColor: 'rgba(59, 130, 246, 0.3)'
    },
    {
      id: 'dipendenti',
      name: 'RISORSE UMANE',
      icon: <Users className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 22,
      description: 'Controversie, infortuni, turnover',
      gradient: 'from-cyan-500 to-sky-600',
      shadowColor: 'rgba(6, 182, 212, 0.3)'
    },
    {
      id: 'produzione',
      name: 'OPERATIONS',
      icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 59,
      description: 'Errori processo, qualità, consegne',
      gradient: 'from-teal-500 to-cyan-600',
      shadowColor: 'rgba(20, 184, 166, 0.3)'
    },
    {
      id: 'clienti',
      name: 'CLIENTI & COMPLIANCE',
      icon: <UserCheck className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 44,
      description: 'Reclami, sanzioni, reputation',
      gradient: 'from-blue-600 to-sky-500',
      shadowColor: 'rgba(37, 99, 235, 0.3)'
    },
    {
      id: 'frodi interne',
      name: 'FRODI INTERNE',
      icon: <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 20,
      description: 'Appropriazione, corruzione, insider',
      gradient: 'from-indigo-500 to-blue-600',
      shadowColor: 'rgba(99, 102, 241, 0.3)'
    },
    {
      id: 'frodi esterne',
      name: 'FRODI ESTERNE',
      icon: <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7" />,
      count: 16,
      description: 'Falsificazione, phishing, furto identità',
      gradient: 'from-sky-600 to-cyan-500',
      shadowColor: 'rgba(2, 132, 199, 0.3)'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.9
    },
    visible: { 
      opacity: 1, 
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="w-full p-3 sm:p-4 lg:p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4 sm:mb-6 lg:mb-8"
      >
        <h2 className={`text-xl sm:text-2xl lg:text-3xl font-bold mb-1 sm:mb-2 ${
          isDarkMode ? 'text-white' : 'text-white'
        }`}>
          🛡️ Sistema Risk Management Enterprise
        </h2>
        <p className={`text-sm sm:text-base lg:text-lg ${
          isDarkMode ? 'text-gray-300' : 'text-gray-200'
        }`}>
          <span className="hidden sm:inline">191 scenari di rischio mappati • 100% compliance Basel II/III</span>
          <span className="sm:hidden">191 rischi • Basel II/III</span>
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 lg:gap-4"
      >
        {categories.map((category) => (
          <motion.div
            key={category.id}
            variants={cardVariants}
            whileHover={{ 
              scale: 1.05,
              transition: { type: "spring", stiffness: 300 }
            }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onCategorySelect(category.id)}
            className="relative cursor-pointer"
            style={{
              filter: `drop-shadow(0 10px 25px ${category.shadowColor})`
            }}
          >
            <div className={`
              relative overflow-hidden rounded-xl
              bg-white/95 dark:bg-gray-800/95
              border border-white/20 dark:border-gray-700/50
              transition-all duration-300
              hover:border-sky-400/50
              h-full flex flex-col
              backdrop-blur-sm
            `}>
              {/* Gradient Header */}
              <div className={`
                h-2 w-full bg-gradient-to-r ${category.gradient}
              `} />

              {/* Content */}
              <div className="p-3 sm:p-4 lg:p-5 flex-1 flex flex-col">
                {/* Icon Container */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`
                    w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl mb-2 sm:mb-3
                    bg-gradient-to-br ${category.gradient}
                    flex items-center justify-center
                    shadow-lg
                  `}
                >
                  <div className="text-white">
                    {category.icon}
                  </div>
                </motion.div>

                {/* Title and Count */}
                <div className="mb-2">
                  <h3 className={`
                    text-xs sm:text-sm lg:text-base font-bold mb-1
                    text-gray-900 dark:text-white
                  `}>
                    <span className="hidden sm:inline">{category.name}</span>
                    <span className="sm:hidden">{category.name.split(' ')[0]}</span>
                  </h3>
                  <div className="flex items-center gap-1 sm:gap-2">
                    <span className={`
                      text-lg sm:text-xl lg:text-2xl font-bold
                      bg-gradient-to-r ${category.gradient}
                      bg-clip-text text-transparent
                    `}>
                      {category.count}
                    </span>
                    <span className={`
                      text-xs sm:text-sm
                      text-gray-600 dark:text-gray-300
                    `}>
                      <span className="hidden sm:inline">eventi mappati</span>
                      <span className="sm:hidden">eventi</span>
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={`
                  text-xs sm:text-sm
                  text-gray-600 dark:text-gray-300
                  line-clamp-2
                  hidden sm:block
                `}>
                  {category.description}
                </p>

                {/* Hover Indicator */}
                <motion.div
                  initial={{ width: 0 }}
                  whileHover={{ width: '100%' }}
                  className={`
                    absolute bottom-0 left-0 h-1
                    bg-gradient-to-r ${category.gradient}
                    transition-all duration-300
                  `}
                />
              </div>

              {/* Background Pattern */}
              <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                <div className={`
                  w-full h-full rounded-full
                  bg-gradient-to-br ${category.gradient}
                  blur-3xl
                `} />
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Stats Bar */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className={`
          mt-4 sm:mt-6 lg:mt-8 p-3 sm:p-4 rounded-xl
          bg-white/80 dark:bg-gray-800/80
          border border-white/20 dark:border-gray-700/50
          backdrop-blur-sm
        `}
      >
        <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
          <div className="text-center">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}>
              191
            </div>
            <div className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-200'
            }`}>
              Rischi Totali
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}>
              7
            </div>
            <div className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-200'
            }`}>
              Categorie
            </div>
          </div>
          <div className="text-center">
            <div className={`text-lg sm:text-xl lg:text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-white'
            }`}>
              100%
            </div>
            <div className={`text-xs sm:text-sm ${
              isDarkMode ? 'text-gray-300' : 'text-gray-200'
            }`}>
              Basel II/III
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default RiskCategoryCards;