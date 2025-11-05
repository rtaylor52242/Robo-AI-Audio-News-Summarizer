
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Status } from '../types';
import { Loader } from './Loader';
import { decode, decodeAudioData, createWavBlob } from '../utils/audioUtils';
import { PlayIcon, PauseIcon, DownloadIcon, VolumeIcon, SpeedIcon } from './Icons';

interface SummaryDisplayProps {
  summary: string;
  base64Audio: string | null;
  status: Status;
  error: string | null;
  autoPlay: boolean;
  onAutoPlayDone: () => void;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({ summary, base64Audio, status, error, autoPlay, onAutoPlayDone }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      const context = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextRef.current = context;
      const gainNode = context.createGain();
      gainNode.connect(context.destination);
      gainNodeRef.current = gainNode;
    }
    
    return () => {
      // Intentionally not closing context on unmount to allow it to persist
    };
  }, []);

  // Effect to stop audio playback when the audio source changes (e.g., new summary, new voice)
  useEffect(() => {
    if (audioSourceRef.current) {
      audioSourceRef.current.onended = null; // Prevent onended callback from firing on manual stop
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsPlaying(false);
  }, [base64Audio]);


  const handlePlayPause = useCallback(async () => {
    if (!base64Audio || !audioContextRef.current || !gainNodeRef.current) return;
    
    if (audioContextRef.current.state === 'suspended') {
      await audioContextRef.current.resume();
    }

    if (isPlaying) {
      if (audioSourceRef.current) {
        audioSourceRef.current.stop();
      }
      setIsPlaying(false);
    } else {
      try {
        if (audioSourceRef.current) {
          audioSourceRef.current.stop();
        }

        const decodedData = decode(base64Audio);
        const audioBuffer = await decodeAudioData(decodedData, audioContextRef.current);
        
        const source = audioContextRef.current.createBufferSource();
        source.buffer = audioBuffer;
        source.playbackRate.value = playbackRate;
        source.connect(gainNodeRef.current);
        
        source.onended = () => {
          setIsPlaying(false);
          audioSourceRef.current = null;
        };

        source.start(0);
        audioSourceRef.current = source;
        setIsPlaying(true);
      } catch (e) {
        console.error("Failed to play audio:", e);
      }
    }
  }, [base64Audio, isPlaying, playbackRate]);

  // Effect to handle automatic playback
  useEffect(() => {
    if (autoPlay && base64Audio && status === 'ready') {
      handlePlayPause();
      onAutoPlayDone();
    }
  }, [autoPlay, base64Audio, status, handlePlayPause, onAutoPlayDone]);

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (gainNodeRef.current) {
      gainNodeRef.current.gain.value = newVolume;
    }
  };

  const handlePlaybackRateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newRate = parseFloat(e.target.value);
    setPlaybackRate(newRate);
    if (audioSourceRef.current) {
      audioSourceRef.current.playbackRate.value = newRate;
    }
  };

  const handleDownload = useCallback(() => {
    if (!base64Audio || !summary) return;
    try {
      const today = new Date();
      const yyyy = today.getFullYear();
      const mm = String(today.getMonth() + 1).padStart(2, '0');
      const dd = String(today.getDate()).padStart(2, '0');
      const dateString = `${yyyy}-${dd}-${mm}`;

      const description = summary
        .split(' ')
        .slice(0, 4)
        .join('-')
        .replace(/[^a-zA-Z0-9-]/g, '')
        .toLowerCase();
      
      const fileName = `${description || 'summary'}_${dateString}.wav`;

      const decodedData = decode(base64Audio);
      const wavBlob = createWavBlob(decodedData);
      const url = URL.createObjectURL(wavBlob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (e) {
      console.error('Failed to prepare audio for download:', e);
    }
  }, [base64Audio, summary]);


  const renderContent = () => {
    if (status === 'summarizing' || status === 'generating') {
      return (
        <div className="flex flex-col items-center justify-center p-8">
          <Loader className="w-12 h-12 text-cyan-400" />
          <p className="mt-4 text-lg text-gray-300">
            {status === 'summarizing' ? 'Crafting your summary...' : 'Generating audio...'}
          </p>
        </div>
      );
    }

    if (status === 'error' && error) {
      return (
        <div className="p-6 bg-red-900/50 border border-red-700 rounded-lg text-center">
          <h3 className="text-xl font-semibold text-red-300">An Error Occurred</h3>
          <p className="mt-2 text-red-400">{error}</p>
        </div>
      );
    }

    if (status === 'ready' && summary) {
      return (
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-white mb-3">Your Audio Summary</h2>
            <div className="flex items-center gap-4 bg-gray-900/70 p-4 rounded-lg border border-gray-700">
              <button
                onClick={handlePlayPause}
                className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-cyan-500 text-white hover:bg-cyan-600 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <PauseIcon className="w-8 h-8"/> : <PlayIcon className="w-8 h-8 pl-1"/>}
              </button>
              <div className="flex-grow flex flex-col gap-3">
                <div className="flex items-center gap-3">
                  <label htmlFor="volume-control" className="flex items-center gap-2 text-gray-400 text-sm flex-shrink-0 w-20">
                    <VolumeIcon className="w-6 h-6" />
                    <span>Volume</span>
                  </label>
                  <input
                    id="volume-control"
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer thumb:bg-cyan-400"
                    aria-label="Volume control"
                  />
                </div>
                 <div className="flex items-center gap-3">
                  <label htmlFor="speed-control" className="flex items-center gap-2 text-gray-400 text-sm flex-shrink-0 w-20">
                    <SpeedIcon className="w-6 h-6" />
                    <span>Speed</span>
                  </label>
                  <input
                    id="speed-control"
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={playbackRate}
                    onChange={handlePlaybackRateChange}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer thumb:bg-cyan-400"
                    aria-label="Playback speed control"
                  />
                  <span className="text-gray-400 text-sm font-mono w-12 text-center">{playbackRate.toFixed(1)}x</span>
                </div>
              </div>
              <button
                onClick={handleDownload}
                className="flex-shrink-0 w-14 h-14 flex items-center justify-center rounded-full bg-gray-700 text-cyan-400 hover:bg-gray-600 hover:text-cyan-300 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-cyan-300"
                aria-label="Download Audio"
              >
                <DownloadIcon className="w-7 h-7" />
              </button>
            </div>
          </div>
          <div>
             <h3 className="text-xl font-semibold text-gray-200 mb-2">Transcript</h3>
             <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{summary}</p>
          </div>
        </div>
      );
    }

    return null; // Render nothing for 'idle' state or if no summary
  };

  return <div className="mt-8 min-h-[200px] bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 shadow-2xl border border-gray-700 transition-opacity duration-500">
      {renderContent()}
    </div>;
};
