import config from '../js/modules/config';
import { debugLog } from '../js/modules/tracking';
import { store } from '@/js/stores/compass-store.js';
import { pageview } from 'vue-gtag';

const About = () => import('../js/views/About.vue');
const Compass = () => import('../js/views/Compass.vue');
const Homepage = () => import('../js/views/Homepage.vue');
const Report = () => import('../js/views/Report.vue');
const Embed = () => import('../js/views/CompassEmbed.vue');

const routes = [
  {
    name: 'compass',
    path: '/:locale/compass/:metric/:geographyLevel?',
    component: Compass,
  },
  {
    name: 'report',
    path: '/:locale/report/:geographyLevel/',
    component: Report,
  },
  {
    name: 'embed',
    path: '/:locale/embed/:metric/:geographyLevel/',
    component: Embed,
  },
  {
    name: 'about',
    path: '/:locale/about/',
    component: About,
  },
  {
    name: 'homepage',
    path: '/:locale/',
    component: Homepage,
  },
  {
    name: 'homepage-en',
    path: '/',
    redirect: { name: 'homepage', params: { locale: 'en' } },
  },
  {
    name: 'wildcard',
    path: '/:pathMatch(.*)/*',
    redirect: { name: 'homepage', params: { locale: 'en' } },
  },
];

const routerOptions = {
  encodeQuery: true,
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (to.hash) {
      return { selector: to.hash, offset: { x: 0, y: 60 } };
    } if (savedPosition) {
      return savedPosition;
    }
    return { x: 0, y: 0 };
  },
};

function getValidGeographyLevelForMetric(geographyLevel, metricId) {
  if (config.dataConfig[`m${metricId}`].geographies.includes(geographyLevel)) {
    return geographyLevel;
  }
  return config.dataConfig[`m${metricId}`].geographies[0];
}


const setUpRouterHooks = function(router) {

  // Validate params.
  router.beforeEach((to, from) => {
    debugLog('Route guard: Validate params');
    debugLog(`${from.path} => ${to.path}`);
    debugLog(to);

    // Check locale.
    if (to.params.locale && !(['en', 'es'].includes(to.params.locale))) {
      return {...to, params: {...to.params, locale: 'en'}};
    }

    // Validate Geography Level & metric
    let geographyLevel = null;
    if (to.name === 'compass') {
      if (!('metric' in to.params) || !(`m${to.params.metric}` in config.dataConfig)) {
        return {
          name: 'homepage',
          params: {locale: ('locale' in to.params) ? to.params.locale : 'en'}
        };
      }

      // First set default value for geography level.
      if ('geographyLevel' in to.params) {
        geographyLevel = to.params.geographyLevel;
      }
      else if ('geographyLevel' in from.params) {
        geographyLevel = from.params.geographyLevel;
      } else {
        geographyLevel = 'blockgroup';
      }

      // Then check if that is valid for metric and otherwise choose something else.
      geographyLevel = getValidGeographyLevelForMetric(geographyLevel, to.params.metric);

      if (geographyLevel !== to.params.geographyLevel) {
        return {
          name: 'compass',
          params: {...to.params, geographyLevel}
        };
      }
    }
  });

// // Load geography & selected on each route.
  router.afterEach(async (to) => {
    if (to.name === 'compass') {
      debugLog("Route guard: store last compass path");
      store.lastCompassRoute = to;
    }
    pageview(to);
  });

  return router;
}

export { routerOptions, setUpRouterHooks };
