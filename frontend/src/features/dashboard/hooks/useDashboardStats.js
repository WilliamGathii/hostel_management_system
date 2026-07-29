import { useCallback, useEffect, useState } from 'react';

import { getDashboardStats } from '../../reports/services/report.service';

export const useDashboardStats = () => {
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const loadStats = useCallback(async () => {
    setIsLoading(true);
    setHasError(false);
    try {
      setStats(await getDashboardStats());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  return { stats, isLoading, hasError, reload: loadStats };
};
