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
      icon: <Flame className="w-8 h-8" />,
      count: 10,
      description: 'Disastri naturali, incendi, furti',
      gradient: 'from-red-500 to-orange-500',
      shadowColor: 'rgba(239, 68, 68, 0.4)'
    },
    {
      id: 'sistemi',
      name: 'SISTEMI & IT',
      icon: <Monitor className="w-8 h-8" />,
      count: 20,
      description: 'Cyber attack, downtime, data breach',
      gradient: 'from-blue-500 to-cyan-500',
      shadowColor: 'rgba(59, 130, 246, 0.4)'
    },
    {
      id: 'dipendenti',
      name: 'RISORSE UMANE',
      icon: <Users className="w-8 h-8" />,
      count: 22,
      description: 'Controversie, infortuni, turnover',
      gradient: 'from-purple-500 to-pink-500',
      shadowColor: 'rgba(168, 85, 247, 0.4)'
    },
    {
      id: 'produzione',
      name: 'OPERATIONS',
      icon: <Settings className="w-8 h-8" />,
      count: 59,
      description: 'Errori processo, qualità, consegne',
      gradient: 'from-green-500 to-emerald-500',
      shadowColor: 'rgba(34, 197, 94, 0.4)'
    },
    {
      id: 'clienti',
      name: 'CLIENTI & COMPLIANCE',
      icon: <UserCheck className="w-8 h-8" />,
      count: 44,
      description: 'Reclami, sanzioni, reputation',
      gradient: 'from-yellow-500 to-amber-500',
      shadowColor: 'rgba(234, 179, 8, 0.4)'
    },
    {
      id: 'frodi interne',
      name: 'FRODI INTERNE',
      icon: <ShieldAlert className="w-8 h-8" />,
      count: 20,
      description: 'Appropriazione, corruzione, insider',
      gradient: 'from-indigo-500 to-purple-500',
      shadowColor: 'rgba(99, 102, 241, 0.4)'
    },
    {
      id: 'frodi esterne',
      name: 'FRODI ESTERNE',
      icon: <AlertTriangle className="w-8 h-8" />,
      count: 16,
      description: 'Falsificazione, phishing, furto identità',
      gradient: 'from-rose-500 to-red-500',
      shadowColor: 'rgba(244, 63, 94, 0.4)'
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
    <div className="w-full p-6">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className={`text-3xl font-bold mb-2 ${
          isDarkMode ? 'text-white' : 'text-gray-900'
        }`}>
          🛡️ Sistema Risk Management Enterprise
        </h2>
        <p className={`text-lg ${
          isDarkMode ? 'text-gray-400' : 'text-gray-600'
        }`}>
          191 scenari di rischio mappati • 100% compliance Basel II/III
        </p>
      </motion.div>

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
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
              relative overflow-hidden rounded-2xl
              ${isDarkMode ? 'bg-gray-800' : 'bg-white'}
              border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
              transition-all duration-300
              hover:border-transparent
            `}>
              {/* Gradient Header */}
              <div className={`
                h-2 w-full bg-gradient-to-r ${category.gradient}
              `} />

              {/* Content */}
              <div className="p-6">
                {/* Icon Container */}
                <motion.div
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.6 }}
                  className={`
                    w-16 h-16 rounded-2xl mb-4
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
                <div className="mb-3">
                  <h3 className={`
                    text-lg font-bold mb-1
                    ${isDarkMode ? 'text-white' : 'text-gray-900'}
                  `}>
                    {category.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className={`
                      text-2xl font-bold
                      bg-gradient-to-r ${category.gradient}
                      bg-clip-text text-transparent
                    `}>
                      {category.count}
                    </span>
                    <span className={`
                      text-sm
                      ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                    `}>
                      eventi mappati
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className={`
                  text-sm
                  ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}
                  line-clamp-2
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
          mt-8 p-4 rounded-xl
          ${isDarkMode ? 'bg-gray-800/50' : 'bg-gray-50'}
          border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}
        `}
      >
        <div className="flex flex-wrap justify-center gap-8">
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              191
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Rischi Totali
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              7
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              Categorie
            </div>
          </div>
          <div className="text-center">
            <div className={`text-2xl font-bold ${
              isDarkMode ? 'text-white' : 'text-gray-900'
            }`}>
              100%
            </div>
            <div className={`text-sm ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
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