'use client';

import { useState, useEffect } from 'react';

interface Config {
  baiduPanUrl: string;
  quarkPanUrl: string;
}

export function useConfig() {
  const [config, setConfig] = useState<Config | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchConfig = async () => {
      try {
        const response = await fetch('/api/config');
        const data = await response.json();
        setConfig(data);
      } catch {
        setConfig({ baiduPanUrl: '', quarkPanUrl: '' });
      } finally {
        setLoading(false);
      }
    };

    fetchConfig();
  }, []);

  return { config, loading };
}