// frontend/src/components/ErrorModal.js
import React from "react";
import { X } from "lucide-react";

const ErrorModal = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-dark-card p-6 rounded-xl w-full max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white"
        >
          <X size={20} />
        </button>
        <h2 className="text-lg font-semibold mb-4 text-red-500">Ошибка</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg"
        >
          Закрыть
        </button>
      </div>
    </div>
  );
};

export default ErrorModal;
