// eng4IT/frontend/src/components/ConfirmDeleteModal.js
import React from "react";
import { motion } from "framer-motion";

const ConfirmDeleteModal = ({ isOpen, onClose, onConfirm, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        className="bg-dark-card p-6 rounded-lg shadow-lg text-center"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Подтверждение удаления
        </h3>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg"
          >
            Удалить
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg"
          >
            Отмена
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ConfirmDeleteModal;
