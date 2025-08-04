import { useEffect } from 'react';

interface WebVitalsMetric {
  name: string;
  value: number;
  rating: 'good' | 'needs-improvement' | 'poor';
  delta: number;
  id: string;
}

export const PerformanceMonitor = () => {
  useEffect(() => {
    // Only run in production and if web vitals are supported
    if (process.env.NODE_ENV !== 'production' || typeof window === 'undefined') {
      return;
    }

    const reportWebVitals = (metric: WebVitalsMetric) => {
      // Log to console in development
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Web Vitals] ${metric.name}:`, {
          value: metric.value,
          rating: metric.rating,
          delta: metric.delta,
          id: metric.id,
        });
      }

      // Send to analytics service (Google Analytics, etc.)
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', metric.name, {
          event_category: 'Web Vitals',
          event_label: metric.id,
          value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
          non_interaction: true,
        });
      }

      // You can also send to other analytics services here
      // Example: Supabase analytics, custom endpoint, etc.
    };

    // Dynamically import web-vitals to avoid bundle bloat
    import('web-vitals').then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(reportWebVitals);
      getFID(reportWebVitals);
      getFCP(reportWebVitals);
      getLCP(reportWebVitals);
      getTTFB(reportWebVitals);
    }).catch((error) => {
      console.warn('Failed to load web-vitals:', error);
    });

    // Monitor custom performance metrics
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Track navigation timing
        if (entry.entryType === 'navigation') {
          const navEntry = entry as PerformanceNavigationTiming;
          const metrics = {
            dns: navEntry.domainLookupEnd - navEntry.domainLookupStart,
            tcp: navEntry.connectEnd - navEntry.connectStart,
            request: navEntry.responseStart - navEntry.requestStart,
            response: navEntry.responseEnd - navEntry.responseStart,
            dom: navEntry.domContentLoadedEventEnd - navEntry.responseEnd,
            load: navEntry.loadEventEnd - navEntry.loadEventStart,
          };

          if (process.env.NODE_ENV === 'development') {
            console.log('[Navigation Timing]:', metrics);
          }

          // Send navigation metrics to analytics
          if (typeof window !== 'undefined' && (window as any).gtag) {
            Object.entries(metrics).forEach(([key, value]) => {
              if (value > 0) {
                (window as any).gtag('event', 'navigation_timing', {
                  event_category: 'Performance',
                  event_label: key,
                  value: Math.round(value),
                  non_interaction: true,
                });
              }
            });
          }
        }

        // Track resource loading
        if (entry.entryType === 'resource') {
          const resourceEntry = entry as PerformanceResourceTiming;
          
          // Track slow resources (> 1 second)
          if (resourceEntry.duration > 1000) {
            if (process.env.NODE_ENV === 'development') {
              console.warn('[Slow Resource]:', {
                name: resourceEntry.name,
                duration: resourceEntry.duration,
                size: resourceEntry.transferSize,
              });
            }

            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'slow_resource', {
                event_category: 'Performance',
                event_label: resourceEntry.name,
                value: Math.round(resourceEntry.duration),
                non_interaction: true,
              });
            }
          }
        }
      });
    });

    // Observe navigation and resource timing
    try {
      observer.observe({ entryTypes: ['navigation', 'resource'] });
    } catch (error) {
      console.warn('Performance Observer not supported:', error);
    }

    // Monitor memory usage (if available)
    const monitorMemory = () => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        const memoryInfo = {
          used: Math.round(memory.usedJSHeapSize / 1048576), // MB
          total: Math.round(memory.totalJSHeapSize / 1048576), // MB
          limit: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('[Memory Usage]:', memoryInfo);
        }

        // Alert if memory usage is high (> 80% of limit)
        if (memoryInfo.used / memoryInfo.limit > 0.8) {
          console.warn('High memory usage detected:', memoryInfo);
          
          if (typeof window !== 'undefined' && (window as any).gtag) {
            (window as any).gtag('event', 'high_memory_usage', {
              event_category: 'Performance',
              event_label: 'memory_warning',
              value: Math.round((memoryInfo.used / memoryInfo.limit) * 100),
              non_interaction: true,
            });
          }
        }
      }
    };

    // Monitor memory every 30 seconds
    const memoryInterval = setInterval(monitorMemory, 30000);

    // Cleanup
    return () => {
      observer.disconnect();
      clearInterval(memoryInterval);
    };
  }, []);

  // This component doesn't render anything
  return null;
};

// Hook for manual performance tracking
export const usePerformanceTracker = () => {
  const trackCustomMetric = (name: string, value: number, category = 'Custom') => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', name, {
        event_category: category,
        value: Math.round(value),
        non_interaction: true,
      });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`[Custom Metric] ${name}:`, value);
    }
  };

  const startTimer = (name: string) => {
    const startTime = performance.now();
    
    return {
      end: (category = 'Timing') => {
        const duration = performance.now() - startTime;
        trackCustomMetric(name, duration, category);
        return duration;
      }
    };
  };

  return {
    trackCustomMetric,
    startTimer,
  };
};
