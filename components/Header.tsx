
import React from 'react';
import { RobotIcon } from './Icons';

export const Header: React.FC = () => {
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-4">
        <RobotIcon className="w-12 h-12 text-cyan-400" />
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Robo AI
          </h1>
          <p className="text-lg text-cyan-300">Audio News Summarizer</p>
        </div>
      </div>
    </header>
  );
};
