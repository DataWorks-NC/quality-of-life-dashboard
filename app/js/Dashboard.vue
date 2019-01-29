<template>
    <div>
    <div class="demo-layout mdl-layout mdl-js-layout mdl-layout--fixed-header">
        <header class="mdl-layout__header mdl-color--blue-grey-900 mdl-color-text--blue-grey-50">
            <div aria-label="sidebar menu" aria-expanded="false" role="button" tabindex="0" class="mdl-layout__drawer-button">
                <svg class="icon icon-menu mdl-color-text--blue-grey-50"><use xmlns:xlink="https://www.w3.org/1999/xlink" xlink:href="#icon-menu"></use></svg>
            </div>
            <div class="mdl-layout__header-row">
                <span class="mdl-layout-title"><a href="./"><img src="img/logo.png" alt="TITLE GOES HERE"/></a></span>
                <div class="mdl-layout-spacer"></div>
                <div class="header-nav" style="height: 54px;">
                    <nav class="mdl-navigation">
                        <a class="mdl-navigation__link mdl-typography--text-uppercase mdl-color-text--blue-grey-50" onclick="ga('send', 'event', 'download', 'metric zip file download')" href="downloads/qol-data.zip">Download Data</a>
                    </nav>
                </div>
            </div>
        </header>
        <Sidebar></Sidebar>
    </div>
    <div class="mdl-layout__content">
        <div class="mdl-grid">
            <div>sc-offline</div>
            <div>sc-tabs</div>
            <div class="mdl-shadow--2dp mdl-color--white mdl-cell mdl-cell--8-col">
                <div class="map-container" style="position: relative">
                    <div>sc-map</div>
                    <div>sc-legend</div>
                </div>
                <div class="flexcontainer">
                    <div class="flex-item mdl-typography--text-right">
                        <div>sc-years</div>
                    </div>
                    <div>sc-undermap-buttons</div>
                </div>
                <div>sc-datatable</div>
                <div class="demo-separator mdl-cell--1-col"></div>
                <div>sc-metadata</div>
            </div>
            <div class="demo-cards mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-grid mdl-grid--no-spacing">
                <div>sc-geography-switcher</div>
                <div class="demo-separator mdl-cell--1-col"></div>
                <div>sc-distributionchart</div>
                <div class="demo-separator mdl-cell--1-col"></div>
                <div>sc-trendchart</div>
                <div class="demo-separator mdl-cell--1-col"></div>
                <div>sc-feedback</div>
                <div class="demo-separator mdl-cell--1-col"></div>
                <div class="mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet mdl-cell--12-col-desktop mdl-typography--text-center">
                    <div>sc-social</div>
                </div>
            </div>
        </div>
        <div class="mdl-grid demo-cards">
            <div>sc-embedcode</div>
            <div v-if="siteConfig.contactForm" class="mdl-typography--text-center mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet comment-container">
                <div class="comment-form">
                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused">
                        <input class="mdl-textfield__input" type="email" id="contact-email" required autocomplete="off">
                        <label class="mdl-textfield__label" for="contact-email">Email Address</label>
                    </div>
                    <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label is-focused">
                        <textarea class="mdl-textfield__input" type="text" rows="3" id="contact-message" required autocomplete="off"></textarea>
                        <label class="mdl-textfield__label" for="contact-message">Message</label>
                    </div>
                    <p>
                        <button class="mdl-button mdl-js-button mdl-button--raised mdl-js-ripple-effect mdl-button--accent" style="display: inline"
                                id="contact-submit">
                            Contact Us
                        </button>
                    </p>
                </div>
                <div class="comment-complete">
                    <p>
                        <i class="material-icons">thumb_up</i><br> Thanks!
                    </p>
                </div>
            </div>
            <div v-if="siteConfig.whatsnew" class="mdl-color--white mdl-shadow--2dp mdl-cell mdl-cell--4-col mdl-cell--12-col-tablet whatsnew">
                <div class="">
                    <h1 class="mdl-typography--text-center">What's New</h1>
                    <span class="mdl-chip mdl-color--teal mdl-color-text--white" v-for="item in siteConfig.whatsnew">
                            <span class="mdl-chip__text" :data-whatsnew="item.metric">{{item.title}}</span>
                        </span>
                </div>
            </div>
        </div>
        <div>sc-footer</div>
    </div>
    </div>
</template>

<script>
import Sidebar from './components/sidebar.vue';
import siteConfig from '../../data/config/site';

export default {
  name: 'Dashboard',
  data: () => ({
    siteConfig: siteConfig,
  }),
  components: {
    Sidebar,
  },
};
</script>

<style scoped>

</style>
