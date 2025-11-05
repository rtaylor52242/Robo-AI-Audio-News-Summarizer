
import React from 'react';
import { Status } from '../types';
import { Loader } from './Loader';
import { SoundWaveIcon, ClearIcon } from './Icons';

interface ArticleInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onSubmit: () => void;
  onClear: () => void;
  status: Status;
  selectedVoice: string;
  onVoiceChange: (voice: string) => void;
}

const VOICES = [
  { id: 'Kore', name: 'Kore (Female)' },
  { id: 'Puck', name: 'Puck (Male)' },
  { id: 'Charon', name: 'Charon (Male, Deep)' },
  { id: 'Fenrir', name: 'Fenrir (Male)' },
  { id: 'Zephyr', name: 'Zephyr (Female)' },
];


export const ArticleInput: React.FC<ArticleInputProps> = ({ value, onChange, onSubmit, onClear, status, selectedVoice, onVoiceChange }) => {
  const isLoading = status === 'summarizing' || status === 'generating';
  
  const getButtonText = () => {
    switch (status) {
      case 'summarizing':
        return 'Summarizing...';
      case 'generating':
        return 'Generating Audio...';
      default:
        return 'Summarize & Listen';
    }
  };

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700">
      <div className="flex justify-between items-center mb-2">
        <label htmlFor="article-input" className="block text-lg font-medium text-gray-200">
          Paste your news article here
        </label>
         {value.length > 0 && !isLoading && (
          <button
            onClick={onClear}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors"
            aria-label="Clear article text"
          >
            <ClearIcon className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>
      <textarea
        id="article-input"
        value={value}
        onChange={onChange}
        placeholder="Start by pasting the full text of a news article..."
        className="w-full h-48 p-4 bg-gray-900 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-shadow duration-300 resize-none"
        disabled={isLoading}
      />
      <div className="mt-4">
        <label htmlFor="voice-select" className="block text-sm font-medium text-gray-400 mb-1">
          Select a Voice
        </label>
        <select
          id="voice-select"
          value={selectedVoice}
          onChange={(e) => onVoiceChange(e.target.value)}
          disabled={isLoading}
          className="w-full p-2 bg-gray-900 border border-gray-600 rounded-lg text-gray-300 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500"
        >
          {VOICES.map((voice) => (
            <option key={voice.id} value={voice.id}>
              {voice.name}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={onSubmit}
        disabled={isLoading || !value.trim()}
        className="mt-4 w-full flex items-center justify-center gap-3 text-lg font-semibold py-3 px-6 rounded-lg transition-all duration-300 ease-in-out text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-cyan-300 disabled:transform-none"
      >
        {isLoading ? (
          <Loader className="w-6 h-6" />
        ) : (
          <SoundWaveIcon className="w-6 h-6" />
        )}
        <span>{getButtonText()}</span>
      </button>
    </div>
  );
};
