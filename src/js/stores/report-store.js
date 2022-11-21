import { reactive } from 'vue';

export const reportStore = reactive({
  visibleMetrics: new Set(), // Array of IDs of metrics which are visible.
});

export function metricIsVisible(metricId) {
  return reportStore.visibleMetrics.has(metricId);
}

export function showMetric(metricId) {
  reportStore.visibleMetrics.add(metricId);
}

export function hideMetric(metricId) {
  reportStore.visibleMetrics.delete(metricId);
}
