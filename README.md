# Durham Neighborhood Compass

A dashboard for community data and health, maintained by [DataWorks NC](https://www.dataworks-nc.org) and [Research Action Design](https://rad.cat). Live at https://compass.durhamnc.gov

The Dashboard is built using [Vue.js](http://vuejs.org/), [Vuetify](https://vuetifyjs.com), and [Mapbox GL JS](https://www.mapbox.com/mapbox-gl-js/api/).

Portions of this code copyright (c) 2016 Mecklenburg County GIS

Other portions copyright (c) 2018-2023 DataWorks NC

Code released under an MIT license (see License.txt)

## Original source
This repo was forked from, and draws heavily on, Tobin Bradley's work on Mecklenburg QoL dashboard. See their [demo site](http://mcmap.org/qol-dev).

The original Mecklenburg repository with old versions of the Dashboard is [here](https://github.com/tobinbradley/Mecklenburg-County-Quality-of-Life-Dashboard).

### Related Projects

*   [quality-of-life-data](https://github.com/DataWorks-NC/durham-quality-of-life-data)

## Get Started

This project requires [NodeJS](https://nodejs.org).

``` bash
git clone https://github.com/DataWorks-NC/quality-of-life-dashboard.git dashboard
cd dashboard
git clone https://github.com/DataWorks-NC/durham-quality-of-life-data data
npm install
```

You'll then need to copy `.env.example` to a new `.env` file in the repo root and fill in (at minimum) the `VUE_APP_MAPBOX_ACCESS_TOKEN` with a valid mapbox access token. You can use this file to store other local environment variables (for example, for testing Google Analytics), but they're not strictly required.

Then run

```bash
npm run build
npm run dev
```

You should now be able to access the dashboard locally at http://127.0.0.1:3000/.

To build the site for production, see Deployment, below, and the Tehnical Infrastructure Manual.

## Customizing the Dashboard

Most Dashboard customization can be accomplished by creating your own data repository [following the directions here](https://github.com/tobinbradley/mecklenburg-quality-of-life-data). The data repository includes Dashboard meta (title, author, keywords, etc.), map style and configuration settings, data, etc.

## Deployment

Further deployment instructions in the DataWorks NC Technical Infrastructure Manual.

This project includes a python script, `.circleci/deploy.py` for pushing the website to Azure using Blob storage for storage.
In order for this command to succeed, you'll need to have environment variables `AZURE_STORAGE_CONNECTION_STRING` and `AZURE_DESTINATION_BLOB` set to the connection string for your Azure storage container and the destination blob name, respectively. We recommend using `direnv` (https://direnv.net/) to track
these environment variables, as described [here](https://www.taos.com/using-multiple-accounts-aws-cli-direnv/).

To deploy, run `python .circleci/deploy.py ./dist` (make sure that `python-dotenv` is installed locally using `pip install python-dotenv`, and that the Microsoft Azure CLI is also installed). This will deploy everything in the `public` directory to the blob name set in `AZURE_DESTINATION_BLOB` This Azure hosting strategy follows [these instructions by Hao Luo](https://blog.lifeishao.com/2017/05/24/serving-your-static-sites-with-azure-blob-and-cdn).

### Deploying to staging site

To deploy to the staging site (https://nbhdcompassstage.azurewebsites.us/), push changes to `staging` branch in github, and CircleCI will do the rest.

### Sitemap
Run `npm run build-sitemap` to build a sitemap for the site. Sitemap will be built to a file in `public/sitemap.xml`.


## Map glyphs & sprites

Glyphs currently hosted remotely by http://glfonts.lukasmartinelli.ch/. Hosting locally is complicated! But could be needed in the future to switch away from Roboto.

Sprites come from `gh-pages` branch of https://github.com/maputnik/osm-liberty, and in order to avoid CORS issues with Azure they are hosted in an AWS S3 bucket, `nbhd-compass-assets`, at the path `https://nbhd-compass-assets.s3.amazonaws.com/osm-liberty`.

If you update the sprites file, you may need to check for missing sprites as there are a few variant spellings in the data which are missing from the sprites `json` file.


## Testing

We test with the help of [![Browserstack logo](https://raw.githubusercontent.com/DataWorks-NC/quality-of-life-dashboard/main/app/assets/img/browserstack-logo.png)](https://browserstack.com/)

## Translations

All text in the app is dynamically loaded using vue-i18n from the `en.json` and `es.json` files in `app/lang`. The codename for a string needs to match across both files. There are two utility functions in the app as well to more exaily import/export translations:

* `npm run export-translations` - Parses the `en.json` and `es.json` files and outputs a fresh CSV with one column listing every string key, one column with the English version of that text, and another column with the Spanish version of that text. This is a good way to export strings so that translators can work with them.

* `npm run import-translations` - Reads the `translations.csv` file and recreates `en.json` and `es.json` files based on that.

### To add new text to the app

Create the string keys and string items in either English or Spanish in the `en.json` or `es.json` files. If you then run the export_translations script immediately followed by the import_translations script, both languages `json` files will be populated with blank placeholders for any missing text.

# Pinned dependencies
* Vite on 4.2.x because version 4.3 is breaking tests -- see https://github.com/DataWorks-NC/quality-of-life-dashboard/pull/119#issuecomment-1531724946
* Json-stable-stringify on 1.0.2 because new versions are breaking tests
