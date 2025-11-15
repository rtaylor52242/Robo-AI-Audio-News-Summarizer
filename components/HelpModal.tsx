
import React from 'react';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div 
        className="bg-gray-800 rounded-xl shadow-2xl border border-gray-700 max-w-lg w-full p-6 sm:p-8 text-gray-200 animate-fade-in"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
      >
        <h2 className="text-2xl font-bold text-cyan-400 mb-4">How to Use the App</h2>
        <ol className="list-decimal list-inside space-y-3 text-gray-300">
          <li>
            <strong>Paste Article:</strong> Copy the full text of a news article and paste it into the text area.
          </li>
          <li>
            <strong>Select Voice:</strong> (Optional) Choose your preferred voice for the audio summary from the dropdown menu.
          </li>
          <li>
            <strong>Generate:</strong> Click the "Summarize & Listen" button. The app will create a concise summary and generate the audio.
          </li>
          <li>
            <strong>Listen & Control:</strong> Use the audio player to play/pause, adjust volume, change playback speed, or download the summary as a WAV file.
          </li>
          <li>
            <strong>Review History:</strong> Your 10 most recent summaries are saved below. Click on any item to load it into the player.
          </li>
        </ol>
        <div className="mt-8 text-center">
          <button
            onClick={onClose}
            className="font-semibold py-2 px-8 rounded-lg transition-all duration-300 ease-in-out text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 focus:outline-none focus:ring-4 focus:ring-cyan-300"
          >
            Got it!
          </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};
