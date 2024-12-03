// eng4IT/frontend/src/components/ThemeToggle.js
import React from "react";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "../contexts/ThemeContext";

const ThemeToggle = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileTap={{ scale: 0.9 }}
      onClick={toggleTheme}
      className="fixed
                sm:bottom-6 sm:right-6 sm:top-auto
                top-4 right-4
                p-2 sm:p-3
                rounded-full
                bg-dark-card
                border border-gray-800
                shadow-lg
                hover:border-primary
                transition-colors
                z-50"
    >
      <motion.div
        initial={false}
        animate={{ rotate: theme === "dark" ? 0 : 180 }}
        transition={{ duration: 0.3 }}
      >
        {theme === "dark" ? (
          <Sun className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        ) : (
          <Moon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
        )}
      </motion.div>
    </motion.button>
  );
};

export default ThemeToggle;
