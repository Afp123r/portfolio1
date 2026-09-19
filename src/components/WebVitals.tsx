'use client';

import { useEffect } from 'react';

declare global {
  interface Window {
    gtag: (...args: any[]) => void;
  }
}

export default function WebVitals() {
  useEffect(() => {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      // Report Web Vitals to Google Analytics
      const reportWebVitals = (metric: any) => {
        const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || 'G-XXXXXXXXXX';
        
        // Send to Google Analytics
        if (typeof window.gtag === 'function') {
          window.gtag('event', metric.name, {
            event_category: 'Web Vitals',
            event_label: metric.id,
            value: Math.round(metric.value),
            non_interaction: true,
          });
        }

        // Log to console in development
        if (process.env.NODE_ENV === 'development') {
          console.log(`[Web Vitals] ${metric.name}:`, metric.value, metric);
        }
      };

      // Largest Contentful Paint (LCP)
      if ('PerformanceObserver' in window) {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          reportWebVitals({
            name: 'LCP',
            value: lastEntry.startTime,
            id: 'lcp',
          });
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      }

      // First Input Delay (FID)
      if ('PerformanceObserver' in window) {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            reportWebVitals({
              name: 'FID',
              value: entry.processingStart - entry.startTime,
              id: 'fid',
            });
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      }

      // Cumulative Layout Shift (CLS)
      if ('PerformanceObserver' in window) {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach((entry: any) => {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
            }
          });
          reportWebVitals({
            name: 'CLS',
            value: clsValue,
            id: 'cls',
          });
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      }

      // First Contentful Paint (FCP)
      if ('PerformanceObserver' in window) {
        const fcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const fcpEntry = entries.find((entry: any) => entry.name === 'first-contentful-paint');
          if (fcpEntry) {
            reportWebVitals({
              name: 'FCP',
              value: fcpEntry.startTime,
              id: 'fcp',
            });
          }
        });
        fcpObserver.observe({ entryTypes: ['paint'] });
      }

      // Time to First Byte (TTFB)
      if (window.performance && window.performance.timing) {
        window.addEventListener('load', () => {
          const timing = window.performance.timing;
          const ttfb = timing.responseStart - timing.navigationStart;
          reportWebVitals({
            name: 'TTFB',
            value: ttfb,
            id: 'ttfb',
          });
        });
      }
    }
  }, []);

  return null;
}
