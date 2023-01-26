/* eslint-disable no-console */
import { XMLBuilder } from 'fast-xml-parser';
import { includedRoutes } from '../src/includedRoutes.js';
import fs from 'fs';

// Get domain name from command line if it's passed through.
// eslint-disable-next-line no-undef
const domainName = process.argv[2] ? process.argv[2] : 'compass.durhamnc.gov';
// eslint-disable-next-line no-undef
const protocol = (process.argv[3] && process.argv[3] === 'http') ? 'http://' : 'https://';

const today = new Date().toISOString().slice(0, 10);
const builder = new XMLBuilder({ attributesGroupName: '@' });

const siteMapRoutes = includedRoutes().map(url => {
  const enUrl = `${protocol}${domainName}${url.replace(/^\/en|es/,'/en')}`;
  const esUrl = `${protocol}${domainName}${url.replace(/^\/en|es/, '/es')}`;
  return '<url>' + [
    {loc: `${protocol}${domainName}${url}`},
    {"xhtml:link": {
    '@': {
      rel: 'alternate',
      hreflang: 'x-default',
      href: enUrl,
    }
  }},
    {"xhtml:link": {
        '@': {
          rel: 'alternate',
          hreflang: 'en',
          href: enUrl,
        }
      }},
    {"xhtml:link": {
        '@': {
          rel: 'alternate',
          hreflang: 'es',
          href: esUrl,
        }
      }},
    { changefreq: 'monthly'},
    { lastmod:  today },
].map(o => builder.build(o)).join('') + '</url>';
}).join('');

fs.writeFileSync('./dist/sitemap.xml', '<?xml version="1.0" encoding="utf-8" standalone="yes" ?>\n' +
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml" >' + siteMapRoutes + '</urlset>');

console.log('Sitemap written to ./dist/sitemap.xml');
