
import React from 'react';
import { HistoryItem } from '../types';
import { HistoryIcon } from './Icons';

interface HistoryListProps {
  items: HistoryItem[];
  onSelectItem: (item: HistoryItem) => void;
}

export const HistoryList: React.FC<HistoryListProps> = ({ items, onSelectItem }) => {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="mt-8 w-full">
      <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
        <HistoryIcon className="w-7 h-7" />
        Recent Summaries
      </h2>
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 shadow-2xl border border-gray-700">
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li key={item.id}>
              <button
                onClick={() => onSelectItem(item)}
                className="w-full text-left p-4 rounded-lg bg-gray-900 hover:bg-gray-700/50 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-400"
                aria-label={`Play summary: ${item.title}`}
              >
                <p className="text-cyan-400 font-semibold truncate">
                  <span className="text-gray-500 mr-2">{index + 1}.</span>
                  {item.title}
                </p>
                <p className="text-gray-400 text-sm mt-1 truncate pl-6">{item.summary}</p>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
