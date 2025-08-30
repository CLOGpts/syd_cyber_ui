import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Building2, 
  FileText, 
  MapPin, 
  Euro, 
  Calendar, 
  Mail, 
  Phone,
  Globe,
  Users,
  Shield,
  TrendingUp,
  AlertCircle,
  ChevronDown,
  ChevronRight,
  Check,
  X,
  Briefcase,
  Hash
} from 'lucide-react';
import type { VisuraData } from '../../types/visura.types';

interface VisuraDataCardProps {
  data: VisuraData;
  isLoading?: boolean;
}

const VisuraDataCard: React.FC<VisuraDataCardProps> = ({ data, isLoading }) => {
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    identificativi: true,
    economici: true,
    attivita: true,
    sedi: false,
    contatti: true,
    governance: false,
    extra: false
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(value);
  };

  const formatDate = (date: string) => {
    if (!date) return 'N/D';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'ATTIVA': return 'text-green-600 bg-green-100';
      case 'INATTIVA': return 'text-gray-600 bg-gray-100';
      case 'IN LIQUIDAZIONE': return 'text-orange-600 bg-orange-100';
      case 'CESSATA': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const SectionHeader: React.FC<{ 
    title: string; 
    icon: React.ReactNode; 
    section: string;
    color: string;
  }> = ({ title, icon, section, color }) => (
    <motion.div
      onClick={() => toggleSection(section)}
      className={`flex items-center justify-between p-4 cursor-pointer hover:bg-opacity-80 transition-all rounded-t-xl ${color}`}
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center gap-3">
        {icon}
        <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <motion.div
        animate={{ rotate: expandedSections[section] ? 180 : 0 }}
        transition={{ duration: 0.3 }}
      >
        <ChevronDown size={20} />
      </motion.div>
    </motion.div>
  );

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-300 dark:bg-slate-600 rounded w-3/4"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-1/2"></div>
          <div className="h-4 bg-slate-300 dark:bg-slate-600 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-2xl overflow-hidden"
    >
      {/* Header con nome azienda e stato */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white p-6">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold mb-2">{data.denominazione}</h2>
            <p className="text-blue-100">{data.forma_giuridica}</p>
          </div>
          <span className={`px-4 py-2 rounded-full font-semibold ${getStatusColor(data.stato_attivita)}`}>
            {data.stato_attivita}
          </span>
        </div>
      </div>

      {/* Confidence Score */}
      {data.confidence && (
        <div className="px-6 py-3 bg-slate-100 dark:bg-slate-700 border-b">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Affidabilità Estrazione</span>
            <div className="flex items-center gap-2">
              <div className="w-32 bg-gray-200 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${data.confidence * 100}%` }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className={`h-2 rounded-full ${
                    data.confidence > 0.8 ? 'bg-green-500' : 
                    data.confidence > 0.5 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}
                />
              </div>
              <span className="text-sm font-bold">{Math.round(data.confidence * 100)}%</span>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {/* SEZIONE DATI IDENTIFICATIVI */}
        <section className="border-b dark:border-slate-700">
          <SectionHeader
            title="Dati Identificativi"
            icon={<Building2 className="text-blue-700" size={20} />}
            section="identificativi"
            color="bg-blue-50 dark:bg-blue-900/20"
          />
          <AnimatePresence>
            {expandedSections.identificativi && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-4 space-y-3 overflow-hidden"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Partita IVA</label>
                    <p className="font-semibold flex items-center gap-2">
                      <Hash size={16} className="text-blue-500" />
                      {data.partita_iva}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Codice Fiscale</label>
                    <p className="font-semibold">{data.codice_fiscale}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Numero REA</label>
                    <p className="font-semibold">{data.numero_rea}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Camera di Commercio</label>
                    <p className="font-semibold">{data.camera_commercio}</p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Data Costituzione</label>
                    <p className="font-semibold flex items-center gap-2">
                      <Calendar size={16} className="text-blue-500" />
                      {formatDate(data.data_costituzione)}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 dark:text-gray-400">Data Iscrizione REA</label>
                    <p className="font-semibold">{formatDate(data.data_iscrizione_rea)}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SEZIONE DATI ECONOMICI */}
        <section className="border-b dark:border-slate-700">
          <SectionHeader
            title="Dati Economici"
            icon={<Euro className="text-green-700" size={20} />}
            section="economici"
            color="bg-green-50 dark:bg-green-900/20"
          />
          <AnimatePresence>
            {expandedSections.economici && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-4 space-y-4 overflow-hidden"
              >
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">Capitale Sociale</h4>
                  <div className="grid grid-cols-3 gap-4 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    <div>
                      <label className="text-xs text-gray-500">Deliberato</label>
                      <p className="font-bold text-green-600">{formatCurrency(data.capitale_sociale.deliberato)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Sottoscritto</label>
                      <p className="font-bold text-blue-600">{formatCurrency(data.capitale_sociale.sottoscritto)}</p>
                    </div>
                    <div>
                      <label className="text-xs text-gray-500">Versato</label>
                      <p className="font-bold text-purple-600">{formatCurrency(data.capitale_sociale.versato)}</p>
                    </div>
                  </div>
                </div>
                
                {data.fatturato && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">Fatturato</h4>
                    <div className="flex items-center gap-4">
                      <span className="text-2xl font-bold">{formatCurrency(data.fatturato.ultimo_anno || 0)}</span>
                      {data.fatturato.trend && (
                        <TrendingUp className={`${
                          data.fatturato.trend === 'CRESCITA' ? 'text-green-500' :
                          data.fatturato.trend === 'DECRESCITA' ? 'text-red-500' :
                          'text-gray-500'
                        }`} />
                      )}
                    </div>
                  </div>
                )}

                {data.dipendenti && (
                  <div>
                    <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">Dipendenti</h4>
                    <div className="flex items-center gap-2">
                      <Users size={20} className="text-blue-500" />
                      <span className="font-bold">{data.dipendenti.numero_dipendenti || 'N/D'}</span>
                      {data.dipendenti.data_riferimento && (
                        <span className="text-sm text-gray-500">
                          (agg. {formatDate(data.dipendenti.data_riferimento)})
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SEZIONE ATTIVITÀ */}
        <section className="border-b dark:border-slate-700">
          <SectionHeader
            title="Attività e Codici ATECO"
            icon={<Briefcase className="text-purple-700" size={20} />}
            section="attivita"
            color="bg-purple-50 dark:bg-purple-900/20"
          />
          <AnimatePresence>
            {expandedSections.attivita && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-4 space-y-4 overflow-hidden"
              >
                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">Oggetto Sociale</h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-slate-700 p-3 rounded-lg">
                    {data.oggetto_sociale}
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2 text-sm text-gray-600 dark:text-gray-400">Codici ATECO</h4>
                  <div className="space-y-2">
                    {data.codici_ateco.map((ateco, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ x: -20, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className={`flex items-center justify-between p-3 rounded-lg ${
                          ateco.principale 
                            ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-500' 
                            : 'bg-gray-50 dark:bg-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-blue-600">{ateco.codice}</span>
                          <span className="text-sm">{ateco.descrizione}</span>
                        </div>
                        {ateco.principale && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                            PRINCIPALE
                          </span>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg">
                  <Briefcase size={16} className="text-indigo-600" />
                  <span className="font-semibold">Tipo Business:</span>
                  <span className="px-3 py-1 bg-indigo-600 text-white rounded-full text-sm">
                    {data.tipo_business}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SEZIONE CONTATTI */}
        <section className="border-b dark:border-slate-700">
          <SectionHeader
            title="Contatti"
            icon={<Mail className="text-teal-700" size={20} />}
            section="contatti"
            color="bg-teal-50 dark:bg-teal-900/20"
          />
          <AnimatePresence>
            {expandedSections.contatti && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="px-6 py-4 space-y-3 overflow-hidden"
              >
                {data.pec && (
                  <div className="flex items-center gap-3 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                    <Shield className="text-red-600" size={20} />
                    <div>
                      <label className="text-xs text-gray-500 dark:text-gray-400 block">PEC (Certificata)</label>
                      <p className="font-semibold text-red-700 dark:text-red-400">{data.pec}</p>
                    </div>
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4">
                  {data.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={16} className="text-gray-500" />
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block">Email</label>
                        <p className="font-medium">{data.email}</p>
                      </div>
                    </div>
                  )}
                  
                  {data.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone size={16} className="text-gray-500" />
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block">Telefono</label>
                        <p className="font-medium">{data.telefono}</p>
                      </div>
                    </div>
                  )}
                  
                  {data.sito_web && (
                    <div className="flex items-center gap-2">
                      <Globe size={16} className="text-gray-500" />
                      <div>
                        <label className="text-xs text-gray-500 dark:text-gray-400 block">Sito Web</label>
                        <a href={data.sito_web} target="_blank" rel="noopener noreferrer" 
                           className="font-medium text-blue-600 hover:underline">
                          {data.sito_web}
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>
    </motion.div>
  );
};

export default VisuraDataCard;