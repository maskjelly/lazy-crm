import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TaskStatus } from '@prisma/client';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (taskDetails: string, status: TaskStatus) => void;
}

export const AddTaskModal: React.FC<AddTaskModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [taskDetails, setTaskDetails] = useState('');
  const [status, setStatus] = useState<TaskStatus>('Pending');

  const handleSubmit = () => {
    if (taskDetails.trim()) {
      onAdd(taskDetails.trim(), status);
      setTaskDetails('');
      setStatus('Pending');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="bg-white p-6 rounded-lg shadow-lg w-96 max-w-[90%]"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            <h2 className="text-xl font-bold mb-4 text-gray-800">Add New Task</h2>
            <textarea
              value={taskDetails}
              onChange={(e) => setTaskDetails(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded mb-4 h-32 resize-none text-gray-800"
              placeholder="Task details"
            />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as TaskStatus)}
              className="w-full p-2 border border-gray-300 rounded mb-4 text-gray-800"
            >
              <option value="Pending">Upcoming</option>
              <option value="Working">Working</option>
              <option value="Completed">Done</option>
            </select>
            <div className="flex justify-end space-x-2">
              <button onClick={onClose} className="btn btn-secondary text-gray-800">
                Cancel
              </button>
              <button onClick={handleSubmit} className="btn btn-primary text-white" disabled={!taskDetails.trim()}>
                Add Task
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};