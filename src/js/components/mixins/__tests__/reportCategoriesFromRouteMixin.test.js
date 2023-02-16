import { describe, it, expect } from 'vitest';

import parseRouteMixin from '../parseRouteMixin.js';
describe('getVisibleMetrics', () => {
  const mockMixin = parseRouteMixin;

  it('properly parses query', () => {
    mockMixin.$route = { query: {} };
    expect(mockMixin.computed.visibleMetrics()).toEqual([]);
    mockMixin.$route = { query: {visibleMetrics: ['CCC', 'PCTIMP'] } };
    expect(mockMixin.computed.visibleMetrics()).toEqual(['CCC', 'PCTIMP']);
    mockMixin.$route = { query: { visibleMetrics: 'CCC'}  };
    expect(mockMixin.computed.visibleMetrics()).toEqual(['CCC']);
  });
});
