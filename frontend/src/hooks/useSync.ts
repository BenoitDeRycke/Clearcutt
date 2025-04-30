import { useState, useEffect } from 'react';

export function useSync(syncFn: () => Promise<void>, storageKey: string) {
  const [lastSynced, setLastSynced] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(`lastSynced_${storageKey}`);
    if (saved) {
      setLastSynced(new Date(saved));
    }
  }, [storageKey]);

  const handleSync = async () => {
    if (loading) return;

    setLoading(true);
    await syncFn();
    const now = new Date();
    setLastSynced(now);
    localStorage.setItem(`lastSynced_${storageKey}`, now.toISOString());
    setLoading(false);
  };

  return {
    lastSynced,
    handleSync,
    loading,
  };
}