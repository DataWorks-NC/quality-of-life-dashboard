import { describe, it } from 'vitest';
import { shallowMount } from '@vue/test-utils';
import config from '../../../helpers/config.js'

import reportCategoriesFromRouteMixin from '../reportCategoriesFromRouteMixin.js';

const mountComponentWithQuery = (component, query) => shallowMount(component, {
      global: {
        mocks: {
          $route: {query}
        }
      }
    });

const TestComponent = {
    mixins: [reportCategoriesFromRouteMixin],
    data() {
     return {
        geography: {
          id: 'blockgroup'
        }
      };
    },
    template: '<div></div>'
  };
describe('getVisibleMetrics', () => {
  it('properly parses null query', async ({expect}) => {
    const mockComponent = mountComponentWithQuery(TestComponent, {});
    expect(mockComponent.vm.visibleMetrics).toEqual([]);
  });

  it('properly parses array query', async ({expect}) => {
    const mockComponent = mountComponentWithQuery(TestComponent,
      {visibleMetrics: ['CCC', 'PCTIMP']});
    expect(mockComponent.vm.visibleMetrics).toEqual(['CCC', 'PCTIMP']);
  });

  it('properly parses string query', async ({expect}) => {
    const mockComponent = mountComponentWithQuery(TestComponent, {visibleMetrics: 'CCC'});
    expect(mockComponent.vm.visibleMetrics).toEqual(['CCC']);
  });
});

describe('fullyVisibleCategories', () => {
  it('properly returns all categories with no query', async ({expect}) => {
      const mockComponent = mountComponentWithQuery(TestComponent, {});
      expect(mockComponent.vm.fullyVisibleCategories).toEqual(config.categories.sort());
  });
   it('properly returns no categories with one visible metric', async ({expect}) => {
      const mockComponent = mountComponentWithQuery(TestComponent, { visibleMetrics: 'CCC'});
      expect(mockComponent.vm.fullyVisibleCategories).toEqual([]);
  });
    it('properly returns what is in the query parameter otherwise', async ({expect}) => {
      const mockComponent = mountComponentWithQuery(TestComponent, { visibleMetrics: 'CCC', visibleCategories: ['Education']});
      expect(mockComponent.vm.fullyVisibleCategories).toEqual(['Education']);
  });
});

describe('partiallyVisibleCategories', () => {
  it('returns nothing with a null query', async ({expect}) => {
      const mockComponent = mountComponentWithQuery(TestComponent, {});
      expect(mockComponent.vm.partiallyVisibleCategories).toEqual([]);
  });
  it('returns partially visible categories if a few visible metrics are set', async ({expect}) => {
      const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],
        visibleCategories: ['Environment']
      });
      expect(mockComponent.vm.partiallyVisibleCategories).toEqual(['Crime', 'Demographics']);
  });
});

describe('visibleCategories', () => {
  it('returns everything with a null query', async ({expect}) => {
      const mockComponent = mountComponentWithQuery(TestComponent, {});
      expect(mockComponent.vm.visibleCategories).toEqual(config.categories.sort());
  });
  it('returns fully + partially visible categories if a few visible metrics are set', async ({expect}) => {
      const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],
        visibleCategories: ['Environment']
      });
      expect(mockComponent.vm.visibleCategories).toEqual(['Crime', 'Demographics', 'Environment']);
  });
});

describe('getToggleCategoryRoute', () => {
  it('removes a single fully visible category', async ({ expect }) => {
    const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],
        visibleCategories: ['Environment']
      });
      expect(mockComponent.vm.getToggleCategoryRoute('Environment').query).toEqual(
        { visibleCategories: [], visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],}
      );
  });
  it('removes all metrics from a partially visible category', async ({ expect }) => {
        const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],
        visibleCategories: ['Environment']
      });
      expect(mockComponent.vm.getToggleCategoryRoute('Demographics').query).toEqual(
        { visibleCategories: ['Environment'], visibleMetrics: ['P_SQM'],}
      );
  });

  it('adds a fully invisible category', async ({ expect }) => {
       const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],
        visibleCategories: ['Environment']
      });
      expect(mockComponent.vm.getToggleCategoryRoute('Housing').query).toEqual(
         { visibleCategories: ['Environment', 'Housing'], visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],}
  );
  });

  it('clears the querystring if now everything is visible', async ({ expect }) => {
    const allCategoriesButOne = config.categories.filter(c => c === 'Crime');
      const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleCategories: [...allCategoriesButOne],
      });
      expect(mockComponent.vm.getToggleCategoryRoute('Crime').query).toEqual({ visibleCategories: [] }
      );
  });
});

describe('getToggleMetricRoute', () => {
  it('adds/removes a single visible metric', async ({ expect }) => {
    const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM'],
        visibleCategories: ['Environment']
      });
      expect(mockComponent.vm.getToggleMetricRoute('POPDENS').query).toEqual(
        { visibleCategories: ['Environment'], visibleMetrics: ['PTASNL', 'P_SQM'],}
      );

      expect(mockComponent.vm.getToggleMetricRoute('PROXPH').query).toEqual(
       { visibleCategories: ['Environment'], visibleMetrics: ['POPDENS', 'PTASNL', 'P_SQM', 'PROXPH'],}
      );
  });

  it('fully enables a category if this is the last metric in the category', async ({ expect }) => {
     // TODO: This test will need to be updated if more metrics get added to crime cat.
     const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['D_SQM', 'P_SQM', 'PTASNL'],
        visibleCategories: ['Environment']
      });
      expect(mockComponent.vm.getToggleMetricRoute('V_SQM').query).toEqual(
        { visibleCategories: ['Environment', 'Crime'], visibleMetrics: ['PTASNL'],}
      );
  })

  it('removes a category from visibility if this is toggling off a single metric in that category', async ({ expect }) => {
     const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['PTASNL'],
        visibleCategories: ['Environment', 'Crime']
      });
      expect(mockComponent.vm.getToggleMetricRoute('V_SQM').query).toEqual(
        { visibleCategories: ['Environment'], visibleMetrics: ['PTASNL', 'D_SQM', 'P_SQM'],}
      );
  })
  it('clears the query parameter if this is the last invisible metric', async ({ expect }) => {
    const mockComponent = mountComponentWithQuery(TestComponent, {
        visibleMetrics: ['PTASNL'],
      });
      expect(mockComponent.vm.getToggleMetricRoute('PTASNL').query).toEqual(
        { visibleMetrics: [],}
      );
  })
});

