// Service for managing and syncing real-time hotel metrics across the platform

const STORAGE_KEY = 'grandstay_live_metrics';
const EVENT_NAME = 'grandstay_metrics_updated';

// Baseline defaults representing uninitialized/neutral state (metrics are database-driven)
export const DEFAULT_METRICS = {
  venueCount: 0,
  eventsCelebrated: 0,
  clientSatisfaction: 0,
  averageRating: 0.0,
  totalFeedbacks: 0,
  guestCapacity: 0,
  packageCount: 0
};

/**
 * Retrieve current metrics from localStorage merged with verified defaults
 */
export const getLiveMetrics = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_METRICS };
    const parsed = JSON.parse(raw);
    return {
      venueCount: Number(parsed.venueCount) || DEFAULT_METRICS.venueCount,
      eventsCelebrated: Number(parsed.eventsCelebrated) || DEFAULT_METRICS.eventsCelebrated,
      clientSatisfaction: typeof parsed.clientSatisfaction === 'number' 
        ? Math.round(parsed.clientSatisfaction * 10) / 10 
        : DEFAULT_METRICS.clientSatisfaction,
      averageRating: Number(parsed.averageRating) || DEFAULT_METRICS.averageRating,
      totalFeedbacks: Number(parsed.totalFeedbacks) || DEFAULT_METRICS.totalFeedbacks,
      guestCapacity: Number(parsed.guestCapacity) || DEFAULT_METRICS.guestCapacity,
      packageCount: Number(parsed.packageCount) || DEFAULT_METRICS.packageCount
    };
  } catch (e) {
    console.warn('Error reading grandstay_live_metrics from localStorage:', e);
    return { ...DEFAULT_METRICS };
  }
};

/**
 * Persist updated metrics and broadcast change event to all components & windows
 */
export const updateLiveMetrics = (partial) => {
  try {
    const current = getLiveMetrics();
    const updated = {
      ...current,
      ...partial,
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: updated }));
    }
    return updated;
  } catch (e) {
    console.warn('Error saving grandstay_live_metrics:', e);
    return getLiveMetrics();
  }
};

/**
 * Sync metrics when manager fetches /api/v1/analytics/summary
 */
export const syncFromAnalytics = (analyticsData) => {
  if (!analyticsData) return;
  const rating = Number(analyticsData.averageRating) || 0;
  const satisfaction = rating > 0 ? Math.round((rating / 5.0) * 1000) / 10 : 0;
  
  return updateLiveMetrics({
    venueCount: Number(analyticsData.totalVenues) || 0,
    eventsCelebrated: Number(analyticsData.totalReservations) || 0,
    clientSatisfaction: satisfaction,
    averageRating: rating,
    totalFeedbacks: Number(analyticsData.totalFeedbacks) || 0,
    packageCount: Number(analyticsData.totalPackages) || 0
  });
};

/**
 * Subscribe a component to live metrics updates (cross-window storage + in-window CustomEvent)
 */
export const subscribeToMetrics = (callback) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e) => {
    if (e.detail) callback(e.detail);
  };

  const handleStorageEvent = (e) => {
    if (e.key === STORAGE_KEY) {
      callback(getLiveMetrics());
    }
  };

  window.addEventListener(EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};
