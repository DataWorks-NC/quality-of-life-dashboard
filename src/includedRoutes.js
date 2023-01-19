// Specify all routes to be pre-rendered.
// Weird workaround for command line use of this tool.
import dataConfig from '../data/config/data.js';
import selectGroupConfig from '../data/config/selectgroups.js'

let useDataConfig = dataConfig;
if (dataConfig.default) {
  useDataConfig = dataConfig.default;
}


let useSelectGroupConfig = selectGroupConfig;
if (selectGroupConfig.default) {
  useSelectGroupConfig = selectGroupConfig.default;
}

export function includedRoutes() {
  return ['en', 'es'].flatMap(
    lang => ([
        `/${lang}/`,
        `/${lang}/about/`,
        `/${lang}/report/blockgroup/`,
        `/${lang}/report/tract/`,
      ].concat(Object.values(useDataConfig).filter(m => !m.exclude_from_map).flatMap(
        m => m.geographies.flatMap(
          g => [`/${lang}/compass/${m.metric}/${g}/`, `/${lang}/embed/${m.metric}/${g}/`]),
      )).concat(
        Object.keys(useSelectGroupConfig).
          flatMap(t => ['blockgroup', 'tract'].flatMap(
            l => Object.keys(useSelectGroupConfig[t][l]).flatMap(n => [
              `/${lang}/report/${l}/${encodeURIComponent(t)}/${encodeURIComponent(n)}/`
            ])))
      )
    ));
}
