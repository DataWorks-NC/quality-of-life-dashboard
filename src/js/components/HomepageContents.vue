<template>
  <div class="flexcontainer landing-page">
    <div class="flex-item">
      <h2>{{ $t('welcome.title') }}</h2>
      <p>{{ $t('strings.about') }}</p>
      <div v-if="$i18n.locale === 'es'">
        <h3>Cómo usarlo:</h3>
        <v-card color="primary" class="d-flex">
          <v-img src="@/assets/img/Choose_Metric-es.png" alt />
          <v-card-text class="text-white">
            <p class="font-weight-bold">
              Elija una categoría y un tema del menú en la parte superior de la página. Por ejemplo:
              <RouterLink
                :to="{name: 'compass', params: {locale: 'es', metric: 'DIABETES_TOTAL', geographyLevel: 'tract'}}"
                class="get-started-link"
              >
                Diabetes
              </RouterLink>o
              <RouterLink
                :to="{name: 'compass', params: {locale: 'es', metric: 'CCC', geographyLevel: 'blockgroup'}}"
                class="get-started-link"
              >
                Centros de Cuidado de Niños
              </RouterLink>.
            </p>
            <p>En teléfono celular, toque las tres líneas que se encuentran en la parte superior izquierda para abrir el menú</p>
          </v-card-text>
        </v-card>
        <v-card color="primary" class="d-flex">
          <v-img
            src="@/assets/img/Find_Neighborhood-es.png"
            alt
            width="50%"
          />
          <v-card-text class="text-white">
            <p
              class="font-weight-bold"
            >
              Encuentre una dirección o vecindario usando la barra de búsqueda ubicada en el mapa
            </p>
          </v-card-text>
        </v-card>
        <v-card color="primary" class="d-flex">
          <v-img
            src="@/assets/img/Create_Report-es.png"
            alt
            width="50%"
          />
          <v-card-text class="text-white">
            <p
              class="font-weight-bold"
            >
              Genere un informe haciendo clic en el botón “Informe”
            </p>
          </v-card-text>
        </v-card>
      </div>
      <div v-else>
        <h3>Here's how to get started:</h3>
        <v-card color="primary" class="d-flex">
          <v-img cover src="@/assets/img/Choose_Metric.png" alt />
          <v-card-text class="text-white">
            <p class="font-weight-bold">
              Choose a category and topic from the menu at top. For example:
              <RouterLink
                :to="{name: 'compass', params: {locale: 'en', metric: 'DIABETES_TOTAL', geographyLevel: 'tract'}}"
                class="get-started-link"
              >
                Diabetes
              </RouterLink>,
              <RouterLink
                :to="{name: 'compass', params: {locale: 'en', metric: 'SUMEJECT', geographyLevel: 'blockgroup'}}"
                class="get-started-link"
              >
                Evictions
              </RouterLink>, or
              <RouterLink
                :to="{name: 'compass', params: {locale: 'en', metric: 'CCC', geographyLevel: 'blockgroup'}}"
                class="get-started-link"
              >
                Childcare Centers
              </RouterLink>.
            </p>
            <p>On a mobile device, tap the three lines at the top-left to open the menu.</p>
          </v-card-text>
        </v-card>

        <v-card color="primary" class="d-flex">
          <v-img cover src="@/assets/img/Find_Neighborhood.png" alt />
          <v-card-text class="text-white">
            <p
              class="font-weight-bold"
            >
              Find an address or neighborhood using the address search tool on the map.
            </p>
          </v-card-text>
        </v-card>
        <v-card color="primary" class="d-flex">
          <v-img cover src="@/assets/img/Create_Report.png" alt />
          <v-card-text class="text-white">
            <p
              class="font-weight-bold"
            >
              Make a report by clicking the "Report" button.
            </p>
          </v-card-text>
        </v-card>
      </div>
    </div>
  </div>
</template>

<script>
import handleLinksMixin from '@/js/components/mixins/handleLinksMixin.js';

export default {
  name: 'HomepageContents',
  mixins: [handleLinksMixin,],
};
</script>
