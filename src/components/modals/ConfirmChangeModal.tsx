import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmChangeModalProps {
  isOpen: boolean;
  title: string;
  currentItem: string;
  newItem: string;
  warningText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
}

const ConfirmChangeModal: React.FC<ConfirmChangeModalProps> = ({
  isOpen,
  title,
  currentItem,
  newItem,
  warningText = "Questa azione modificherà la categoria selezionata. Sei sicuro di voler continuare?",
  onConfirm,
  onCancel,
  confirmText = "Conferma",
  cancelText = "Annulla"
}) => {
  // Keyboard support: ESC per chiudere
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onCancel]);

  // Prevent event bubbling on modal content click
  const handleModalClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onCancel}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="relative w-full max-w-md mx-auto bg-gray-900 border border-gray-700 rounded-lg shadow-2xl"
            onClick={handleModalClick}
            role="dialog"
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="flex items-center justify-center w-10 h-10 bg-amber-500/20 rounded-full">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
                <h3 id="modal-title" className="text-lg font-semibold text-white">
                  {title}
                </h3>
              </div>
              <button
                onClick={onCancel}
                className="p-1 text-gray-400 hover:text-white transition-colors rounded-md hover:bg-gray-800"
                aria-label="Chiudi modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              <div id="modal-description" className="space-y-4">
                <p className="text-gray-300 text-sm leading-relaxed">
                  {warningText}
                </p>

                {/* Current vs New Item Comparison */}
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 rounded-md border border-gray-700">
                    <p className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-1">
                      Categoria Attuale
                    </p>
                    <p className="text-white font-medium">
                      {currentItem}
                    </p>
                  </div>

                  <div className="flex justify-center">
                    <div className="w-6 h-6 flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  <div className="p-3 bg-sky-900/30 rounded-md border border-sky-700/50">
                    <p className="text-xs font-medium text-sky-400 uppercase tracking-wide mb-1">
                      Nuova Categoria
                    </p>
                    <p className="text-white font-medium">
                      {newItem}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-700 bg-gray-900/50">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-300 bg-gray-800 border border-gray-600 rounded-md hover:bg-gray-700 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="px-4 py-2 text-sm font-medium text-white bg-sky-600 border border-transparent rounded-md hover:bg-sky-700 transition-colors focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 focus:ring-offset-gray-900"
              >
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConfirmChangeModal;