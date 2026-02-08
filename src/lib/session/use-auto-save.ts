'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export type AutoSaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error';

export interface UseAutoSaveOptions<T> {
  data: T;
  onSave: (data: T) => Promise<void>;
  interval?: number;
  debounce?: number;
  enabled?: boolean;
  onSaveComplete?: () => void;
  onSaveError?: (error: Error) => void;
}

export interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  hasChanges: boolean;
  lastSavedAt: Date | null;
  lastSavedAgo: string;
  error: string | null;
  saveNow: () => Promise<void>;
  markChanged: () => void;
  reset: () => void;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 5) return 'just now';
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  return `${Math.floor(seconds / 3600)}h ago`;
}

export function useAutoSave<T>({ data, onSave, interval = 30000, debounce = 1000, enabled = true, onSaveComplete, onSaveError }: UseAutoSaveOptions<T>): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [lastSavedAgo, setLastSavedAgo] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const dataRef = useRef(data);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const intervalTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isSavingRef = useRef(false);

  useEffect(() => { dataRef.current = data; }, [data]);

  useEffect(() => {
    if (!lastSavedAt) return;
    const updateAgo = () => setLastSavedAgo(formatTimeAgo(lastSavedAt));
    updateAgo();
    const timer = setInterval(updateAgo, 10000);
    return () => clearInterval(timer);
  }, [lastSavedAt]);

  const save = useCallback(async () => {
    if (isSavingRef.current || !hasChanges) return;
    isSavingRef.current = true;
    setStatus('saving');
    setError(null);
    try {
      await onSave(dataRef.current);
      setStatus('saved');
      setHasChanges(false);
      setLastSavedAt(new Date());
      onSaveComplete?.();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save';
      setStatus('error');
      setError(errorMessage);
      onSaveError?.(err instanceof Error ? err : new Error(errorMessage));
    } finally {
      isSavingRef.current = false;
    }
  }, [hasChanges, onSave, onSaveComplete, onSaveError]);

  useEffect(() => {
    if (!enabled) return;
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    if (hasChanges) { setStatus('pending'); debounceTimerRef.current = setTimeout(() => {}, debounce); }
    return () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); };
  }, [data, hasChanges, debounce, enabled]);

  useEffect(() => {
    if (!enabled) return;
    intervalTimerRef.current = setInterval(() => { if (hasChanges && !isSavingRef.current) save(); }, interval);
    return () => { if (intervalTimerRef.current) clearInterval(intervalTimerRef.current); };
  }, [enabled, interval, hasChanges, save]);

  const markChanged = useCallback(() => { setHasChanges(true); setStatus('pending'); }, []);
  const saveNow = useCallback(async () => { if (isSavingRef.current) return; await save(); }, [save]);
  const reset = useCallback(() => { setStatus('idle'); setHasChanges(false); setError(null); if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); }, []);

  useEffect(() => () => { if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current); if (intervalTimerRef.current) clearInterval(intervalTimerRef.current); }, []);

  return { status, hasChanges, lastSavedAt, lastSavedAgo, error, saveNow, markChanged, reset };
}
