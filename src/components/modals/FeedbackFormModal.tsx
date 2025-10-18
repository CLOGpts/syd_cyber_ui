import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';

interface FeedbackFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitSuccess?: () => void;
}

interface FeedbackData {
  impressionUI: number | null;
  impressionUtility: number | null;
  easeOfUse: number | null;
  innovation: number | null;
  sydHelpfulness: number | null;
  assessmentClarity: number | null;
  likedMost: string;
  improvements: string;
}

const FeedbackFormModal: React.FC<FeedbackFormModalProps> = ({
  isOpen,
  onClose,
  onSubmitSuccess
}) => {
  const [formData, setFormData] = useState<FeedbackData>({
    impressionUI: null,
    impressionUtility: null,
    easeOfUse: null,
    innovation: null,
    sydHelpfulness: null,
    assessmentClarity: null,
    likedMost: '',
    improvements: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Keyboard support: ESC per chiudere
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isSubmitting, onClose]);

  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validazione base
    const requiredFields = [
      formData.impressionUI,
      formData.impressionUtility,
      formData.easeOfUse,
      formData.innovation,
      formData.sydHelpfulness,
      formData.assessmentClarity
    ];

    if (requiredFields.some(field => field === null)) {
      toast.error('Per favore, completa tutte le valutazioni');
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading('Invio feedback in corso...');

    try {
      const apiBase = import.meta.env.VITE_API_BASE;

      // TESTING: genera sempre un nuovo session_id per permettere invii multipli
      const sessionId = `test-${crypto.randomUUID()}`;

      // Get user info (se disponibile)
      const userEmail = localStorage.getItem('user_email') || null;
      const userId = localStorage.getItem('user_id') || null;

      const payload = {
        sessionId,
        userId,
        userEmail,
        impressionUI: formData.impressionUI,
        impressionUtility: formData.impressionUtility,
        easeOfUse: formData.easeOfUse,
        innovation: formData.innovation,
        sydHelpfulness: formData.sydHelpfulness,
        assessmentClarity: formData.assessmentClarity,
        likedMost: formData.likedMost,
        improvements: formData.improvements
      };

      console.log('📤 Invio feedback:', payload);

      const response = await fetch(`${apiBase}/api/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();
      console.log('📥 Risposta server:', result);

      if (result.success) {
        toast.success('✅ Grazie per il tuo feedback!', { id: toastId });

        // Salva flag per non mostrare più il modal
        localStorage.setItem('feedback_submitted', 'true');

        if (onSubmitSuccess) {
          onSubmitSuccess();
        }

        onClose();
      } else {
        console.error('❌ Errore server:', result);

        // Gestisci errore di duplicato in modo specifico
        if (result.error === 'already_submitted') {
          toast.success('✅ ' + result.message, { id: toastId });
          localStorage.setItem('feedback_submitted', 'true');
          onClose();
        } else {
          throw new Error(result.message || 'Errore durante invio');
        }
      }
    } catch (error) {
      console.error('❌ Errore invio feedback:', error);
      const errorMessage = error instanceof Error ? error.message : 'Errore sconosciuto';
      toast.error('❌ ' + errorMessage, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Radio button component per scale
  const RadioScale = ({
    name,
    value,
    onChange,
    options
  }: {
    name: keyof FeedbackData;
    value: number | null;
    onChange: (value: number) => void;
    options: { value: number; label: string }[];
  }) => (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <label
          key={option.value}
          className={`
            flex-1 min-w-[80px] px-3 py-2 rounded-md border cursor-pointer transition-all
            ${value === option.value
              ? 'bg-sky-600 border-sky-500 text-white'
              : 'bg-gray-800 border-gray-600 text-gray-300 hover:border-sky-500'
            }
          `}
        >
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={() => onChange(option.value)}
            className="sr-only"
          />
          <span className="text-xs font-medium text-center block">
            {option.label}
          </span>
        </label>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto"
          onClick={!isSubmitting ? onClose : undefined}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-2xl mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl my-8"
            onClick={handleModalClick}
            role="dialog"
            aria-labelledby="feedback-modal-title"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-sky-500/20 rounded-full">
                  <MessageSquare className="w-5 h-5 text-sky-500" />
                </div>
                <div>
                  <h3 id="feedback-modal-title" className="text-lg font-semibold text-white">
                    Il tuo feedback ci aiuta a migliorare
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Richiede solo 2 minuti
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isSubmitting}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800 disabled:opacity-50"
                aria-label="Chiudi modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* 1. Prima impressione UI */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  1. Prima impressione: come descriveresti l'interfaccia utente?
                </label>
                <RadioScale
                  name="impressionUI"
                  value={formData.impressionUI}
                  onChange={(value) => setFormData({ ...formData, impressionUI: value })}
                  options={[
                    { value: 1, label: 'Molto positiva' },
                    { value: 2, label: 'Positiva' },
                    { value: 3, label: 'Neutra' },
                    { value: 4, label: 'Negativa' },
                    { value: 5, label: 'Molto negativa' }
                  ]}
                />
              </div>

              {/* 2. Prima impressione utilità */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  2. Prima impressione: potenzialità e utilità dello strumento?
                </label>
                <RadioScale
                  name="impressionUtility"
                  value={formData.impressionUtility}
                  onChange={(value) => setFormData({ ...formData, impressionUtility: value })}
                  options={[
                    { value: 1, label: 'Molto positiva' },
                    { value: 2, label: 'Positiva' },
                    { value: 3, label: 'Neutra' },
                    { value: 4, label: 'Negativa' },
                    { value: 5, label: 'Molto negativa' }
                  ]}
                />
              </div>

              {/* 3. Facilità d'uso */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  3. Quanto è facile da usare?
                </label>
                <RadioScale
                  name="easeOfUse"
                  value={formData.easeOfUse}
                  onChange={(value) => setFormData({ ...formData, easeOfUse: value })}
                  options={[
                    { value: 1, label: 'Molto' },
                    { value: 2, label: 'Abbastanza' },
                    { value: 3, label: 'Poco' },
                    { value: 4, label: 'Per nulla' }
                  ]}
                />
              </div>

              {/* 4. Innovazione */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  4. Quanto è innovativo?
                </label>
                <RadioScale
                  name="innovation"
                  value={formData.innovation}
                  onChange={(value) => setFormData({ ...formData, innovation: value })}
                  options={[
                    { value: 1, label: 'Molto' },
                    { value: 2, label: 'Abbastanza' },
                    { value: 3, label: 'Poco' },
                    { value: 4, label: 'Per nulla' }
                  ]}
                />
              </div>

              {/* 5. Syd Agent */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  5. Syd Agent è stato utile durante la valutazione?
                </label>
                <RadioScale
                  name="sydHelpfulness"
                  value={formData.sydHelpfulness}
                  onChange={(value) => setFormData({ ...formData, sydHelpfulness: value })}
                  options={[
                    { value: 1, label: 'Molto' },
                    { value: 2, label: 'Abbastanza' },
                    { value: 3, label: 'Poco' },
                    { value: 4, label: 'Per nulla' }
                  ]}
                />
              </div>

              {/* 6. Assessment clarity */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  6. Il flusso di valutazione è chiaro?
                </label>
                <RadioScale
                  name="assessmentClarity"
                  value={formData.assessmentClarity}
                  onChange={(value) => setFormData({ ...formData, assessmentClarity: value })}
                  options={[
                    { value: 1, label: 'Molto' },
                    { value: 2, label: 'Abbastanza' },
                    { value: 3, label: 'Poco' },
                    { value: 4, label: 'Per nulla' }
                  ]}
                />
              </div>

              {/* 7. Cosa è piaciuto */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  7. Cosa ti è piaciuto di più? (opzionale)
                </label>
                <textarea
                  value={formData.likedMost}
                  onChange={(e) => setFormData({ ...formData, likedMost: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Scrivi qui il tuo feedback positivo..."
                />
              </div>

              {/* 8. Miglioramenti */}
              <div>
                <label className="block text-sm font-medium text-gray-200 mb-3">
                  8. Cosa miglioreresti, aggiungeresti o elimineresti? (opzionale)
                </label>
                <textarea
                  value={formData.improvements}
                  onChange={(e) => setFormData({ ...formData, improvements: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent resize-none"
                  placeholder="Scrivi qui i tuoi suggerimenti..."
                />
              </div>
            </form>

            {/* Footer Actions */}
            <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-900/50">
              <p className="text-xs text-gray-400">
                Il tuo feedback viene inviato in modo anonimo
              </p>
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 hover:text-white transition-colors disabled:opacity-50"
                >
                  Chiudi
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Send size={16} />
                  {isSubmitting ? 'Invio...' : 'Invia Feedback'}
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default FeedbackFormModal;
