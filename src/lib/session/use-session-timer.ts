'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface SessionTimerState {
  isRunning: boolean;
  startTime: Date | null;
  endTime: Date | null;
  elapsedSeconds: number;
  elapsedMinutes: number;
  formattedTime: string;
}

export interface UseSessionTimerReturn extends SessionTimerState {
  start: () => void;
  stop: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
}

export function useSessionTimer(initialStartTime?: Date | null): UseSessionTimerReturn {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(initialStartTime ?? null);
  const [endTime, setEndTime] = useState<Date | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [pausedAt, setPausedAt] = useState<number | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const calculateElapsed = useCallback(() => {
    if (!startTime) return 0;
    return Math.max(0, Math.floor((new Date().getTime() - startTime.getTime()) / 1000));
  }, [startTime]);

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => setElapsedSeconds(calculateElapsed()), 1000);
      return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
    }
  }, [isRunning, startTime, calculateElapsed]);

  useEffect(() => {
    if (initialStartTime) {
      setStartTime(initialStartTime);
      setElapsedSeconds(Math.floor((new Date().getTime() - initialStartTime.getTime()) / 1000));
    }
  }, [initialStartTime]);

  const start = useCallback(() => { setStartTime(new Date()); setEndTime(null); setElapsedSeconds(0); setPausedAt(null); setIsRunning(true); }, []);
  const stop = useCallback(() => { setEndTime(new Date()); setIsRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); }, []);
  const pause = useCallback(() => { setPausedAt(elapsedSeconds); setIsRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); }, [elapsedSeconds]);
  const resume = useCallback(() => { if (pausedAt !== null && startTime) { const pauseDuration = calculateElapsed() - pausedAt; setStartTime(new Date(startTime.getTime() + pauseDuration * 1000)); setPausedAt(null); setIsRunning(true); } }, [pausedAt, startTime, calculateElapsed]);
  const reset = useCallback(() => { setStartTime(null); setEndTime(null); setElapsedSeconds(0); setPausedAt(null); setIsRunning(false); if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  return { isRunning, startTime, endTime, elapsedSeconds, elapsedMinutes: Math.floor(elapsedSeconds / 60), formattedTime: formatTime(elapsedSeconds), start, stop, pause, resume, reset };
}
