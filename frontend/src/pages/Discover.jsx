import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Smile,
  Zap,
  Cloudy,
  BrainCircuit,
  Film,
  Sparkles,
} from "lucide-react";

// --- Data for our suggestion list ---
const suggestions = [
  { icon: Smile, text: "I want to laugh out loud" },
  { icon: Zap, text: "Show me something thrilling" },
  { icon: Cloudy, text: "I'm in the mood to cry" },
  { icon: BrainCircuit, text: "A mind-bending plot twist" },
  { icon: Film, text: "A nostalgic 90s classic" },
  { icon: Sparkles, text: "Surprise me with something unique" },
];


// =================================================================================
// The Modal Component (defined inside the main component file)
// =================================================================================
const DiscoverModal = ({ handleClose }) => {
  // Add a keyboard listener to close the modal with the 'Escape' key
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleClose]);

  return (
    // The Modal Backdrop (Overlay)
    <motion.div
      onClick={handleClose}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-start pt-24"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* The Modal Panel */}
      <motion.div
        onClick={(e) => e.stopPropagation()} // Prevents click on panel from closing modal
        className="relative bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl w-full max-w-xl rounded-xl shadow-2xl overflow-hidden border border-white/20 dark:border-zinc-700"
        initial={{ scale: 0.95, y: -20, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: -20, opacity: 0 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {/* Input Area */}
        <div className="flex items-center gap-3 p-4 border-b border-gray-200 dark:border-zinc-700">
          <Search className="text-gray-400 dark:text-zinc-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Describe a mood, vibe, or movie..."
            className="w-full bg-transparent focus:outline-none text-lg text-gray-800 dark:text-white placeholder:text-gray-400 dark:placeholder:text-zinc-500"
            autoFocus // Automatically focus the input on open
          />
          <div className="text-xs text-gray-400 dark:text-zinc-500 border border-gray-300 dark:border-zinc-600 rounded px-1.5 py-0.5">
            ESC
          </div>
        </div>

        {/* Suggestions List */}
        <div className="p-2 max-h-[400px] overflow-y-auto">
          <p className="px-2 py-1 text-xs font-semibold text-gray-500 dark:text-zinc-400">
            SUGGESTIONS
          </p>
          <ul>
            {suggestions.map((item, index) => (
              <motion.li
                key={index}
                className="flex items-center gap-4 p-3 rounded-lg cursor-pointer hover:bg-blue-500/10 dark:hover:bg-blue-500/20 text-gray-800 dark:text-white"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.05 + index * 0.05 }} // Staggered animation
              >
                <item.icon className="text-gray-500 dark:text-zinc-400" size={20} />
                <span className="font-medium">{item.text}</span>
              </motion.li>
            ))}
          </ul>
        </div>
      </motion.div>
    </motion.div>
  );
};


// =================================================================================
// The Main Exported Component
// =================================================================================
const Discover = () => {
  const [modalOpen, setModalOpen] = useState(false);

  const open = () => setModalOpen(true);
  const close = () => setModalOpen(false);

  return (
    <div className="h-[calc(100vh-60px)] w-full flex flex-col items-center justify-center p-4 bg-gray-100 dark:bg-zinc-900 transition-colors duration-300">
      
      {/* This is the main content of your discover page */}
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 dark:text-white mb-4">
          Ready for a new experience?
        </h1>
        <p className="text-lg text-gray-500 dark:text-gray-400 mb-8">
          Click below to tell our AI what you're in the mood for.
        </p>
        <motion.button
          onClick={open}
          className="bg-blue-600 text-white font-bold py-3 px-8 rounded-full text-lg shadow-lg shadow-blue-500/20 cursor-pointer"
          whileHover={{ scale: 1.05, y: -2, boxShadow: "0 10px 20px -5px rgba(59, 130, 246, 0.4)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
        >
          Launch CineMood AI
        </motion.button>
      </div>

      {/* AnimatePresence handles the enter/exit animations of the modal */}
      <AnimatePresence>
        {modalOpen && <DiscoverModal handleClose={close} />}
      </AnimatePresence>
    </div>
  );
};

export default Discover;