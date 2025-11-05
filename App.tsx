
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { ArticleInput } from './components/ArticleInput';
import { SummaryDisplay } from './components/SummaryDisplay';
import { HistoryList } from './components/HistoryList';
import { summarizeArticle, generateAudioSummary } from './services/geminiService';
import { Status, HistoryItem } from './types';

function App() {
  const [article, setArticle] = useState('');
  const [summary, setSummary] = useState('');
  const [base64Audio, setBase64Audio] = useState<string | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [error, setError] = useState<string | null>(null);
  const [selectedVoice, setSelectedVoice] = useState('Kore');
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const savedHistory = localStorage.getItem('summaryHistory');
      return savedHistory ? JSON.parse(savedHistory) : [];
    } catch (e) {
      console.error('Failed to load history from localStorage', e);
      return [];
    }
  });
  const [autoPlay, setAutoPlay] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('summaryHistory', JSON.stringify(history));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, [history]);

  const handleSummarizeAndListen = useCallback(async () => {
    if (!article.trim() || (status !== 'idle' && status !== 'ready' && status !== 'error')) {
      return;
    }

    setStatus('summarizing');
    setError(null);
    setSummary('');
    setBase64Audio(null);

    try {
      const summaryResult = await summarizeArticle(article);
      setSummary(summaryResult);
      setStatus('generating');

      const audioResult = await generateAudioSummary(summaryResult, selectedVoice);
      setBase64Audio(audioResult);
      setStatus('ready');
      setAutoPlay(true);
      
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        title: summaryResult.split(' ').slice(0, 8).join(' ') + '...',
        summary: summaryResult,
        base64Audio: audioResult,
      };
      setHistory(prevHistory => [newHistoryItem, ...prevHistory].slice(0, 10)); // Keep last 10
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please try again.';
      setError(`Failed to process article. ${errorMessage}`);
      setStatus('error');
    }
  }, [article, status, selectedVoice]);

  const handleVoiceChange = useCallback((newVoice: string) => {
    setSelectedVoice(newVoice);

    if (summary && status === 'ready') {
      const regenerateAudioForNewVoice = async () => {
        setStatus('generating');
        setBase64Audio(null);
        try {
          const audioResult = await generateAudioSummary(summary, newVoice);
          setBase64Audio(audioResult);
          setStatus('ready');
          setAutoPlay(true);
        } catch (e) {
          console.error(e);
          const errorMessage = e instanceof Error ? e.message : 'An unknown error occurred. Please try again.';
          setError(`Failed to regenerate audio. ${errorMessage}`);
          setStatus('error');
        }
      };
      regenerateAudioForNewVoice();
    }
  }, [summary, status]);

  const handleSelectHistoryItem = useCallback((item: HistoryItem) => {
    setSummary(item.summary);
    setBase64Audio(item.base64Audio);
    setStatus('ready');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleAutoPlayDone = useCallback(() => {
    setAutoPlay(false);
  }, []);

  const handleClearArticle = useCallback(() => {
    setArticle('');
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 font-sans flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-3xl mx-auto">
        <Header />
        <main className="mt-8">
          <ArticleInput
            value={article}
            onChange={(e) => setArticle(e.target.value)}
            onSubmit={handleSummarizeAndListen}
            onClear={handleClearArticle}
            status={status}
            selectedVoice={selectedVoice}
            onVoiceChange={handleVoiceChange}
          />
          <SummaryDisplay
            summary={summary}
            base64Audio={base64Audio}
            status={status}
            error={error}
            autoPlay={autoPlay}
            onAutoPlayDone={handleAutoPlayDone}
          />
          <HistoryList items={history} onSelectItem={handleSelectHistoryItem} />
        </main>
      </div>
    </div>
  );
}

export default App;
