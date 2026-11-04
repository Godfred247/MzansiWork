import { useEffect, useState } from 'react';

/** Shows a short skeleton state on first mount to demonstrate loading UI. */
export function useSimulatedLoad(ms = 450, key?: string) {
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    setLoading(true);
    const t = window.setTimeout(() => setLoading(false), ms);
    return () => window.clearTimeout(t);
  }, [ms, key]);
  return loading;
}