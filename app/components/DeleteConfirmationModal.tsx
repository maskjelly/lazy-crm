import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DeleteConfirmationModalProps {
  projectName: string | null;
  onClose: () => void;
  onConfirm: (projectName: string) => void;
}

export const DeleteConfirmationModal: React.FC<DeleteConfirmationModalProps> = ({
  projectName,
  onClose,
  onConfirm,
}) => {
  const [inputValue, setInputValue] = useState('');

  if (!projectName) return null;

  const handleConfirm = () => {
    if (inputValue === projectName) {
      onConfirm(projectName);
    }
  };

  return (
    <AnimatePresence>
      {projectName && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-background p-6 rounded-lg max-w-md w-full"
          >
            <h2 className="text-xl font-bold mb-4">Delete Project</h2>
            <p className="mb-4">
              Are you sure you want to delete the project  `&rsquo;` {projectName} `&rsquo;`? This action cannot be undone.
            </p>
            <p className="mb-2">Please type the project name to confirm:</p>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="input w-full mb-4"
              placeholder="Type project name here"
            />
            <div className="flex justify-end space-x-4">
              <button onClick={onClose} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                disabled={inputValue !== projectName}
                className="btn btn-primary bg-red-500 hover:bg-red-600 disabled:opacity-50"
              >
                Delete Project
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};