<template>
  <div class="flexcontainer landing-page">
    <div class="flex-item">
      <div v-if="$i18n.locale === 'es'">
        <section>
          <h2>¿Le interesa lo que está cambiando en su comunidad?</h2>
          <p>
            Durham está cambiando tan rápido que a veces es difícil saber cómo y dónde
            está cambiando. Lo que escuchamos y vemos es, a menudo, parte de otras
            tendencias más grandes que están desarrollándose y que conectan realmente a
            los vecindarios de toda la ciudad (personas que quizás aún no se conocen
            pero que comparten aspiraciones y enfrentan problemas parecidos). A pesar de
            las noticias y las redes sociales, los contactos personales y las iglesias,
            y los tradicionales rumores que se escuchan por ahí, todavía hay un montón
            más que podemos aprender sobre la visión más global.
          </p>
          <p>
            Bienvenido al <em>Neighborhood Compass</em> de Durham, un lugar para
            investigar una visión más global de nuestra comunidad y compartir lo que se
            aprende.
          </p>
          <p>
            El <em>Neighborhood Compass</em> es un recurso fundamental que le permite
            seguir los cambios en su comunidad con información que es actualizada
            regularmente y que, a menudo, profundiza esa sensación visceral que usted
            tiene de que el carácter de los vecindarios de Durham está cambiando.
          </p>
          <p>
            Cada año, el <em>Compass</em> crece y aprende junto con sus usuarios,
            agregando conjuntos de datos que resuenan fuertemente en la comunidad y con
            importancia a largo plazo. Es un proyecto cuantitativo con valores
            cualitativos.
          </p>
        </section>
        <section>
          <h3>Cómo citar al <em>compass</em></h3>
          <p>
            Lo animamos a usar la información del <em>Neighborhood Compass</em> de
            Durham en su propio trabajo. Cuando lo haga, por favor mencione a DataWorks
            NC y al <em>Neighborhood Compass</em> de Durham en los créditos, y asegúrese
            de citar tanto el nombre del conjunto de datos al que está accediendo así
            como el año correspondiente.
          </p>
          <p>Un ejemplo de citación, en estilo MLA, es: </p>
          <blockquote>
            DataWorks NC. “Enfermedad Renal Crónica (población adulta), 2017.”
            <em>Durham Neighborhood Compass</em>,
            compass.durhamnc.gov/es/compass/CKD_TOTAL/tract. Obtenido el 19 feb. 2020.
          </blockquote>
        </section>
        <section>
          <h3>Cómo usar este sitio</h3>
          <p>
            Para saber más acerca de cómo usar el Compass, mire los tutoriales en video
            de los becarios de DataWorks del otoño de 2019, Sydney y Jesse.
          </p>
          <iframe
            v-for="youtubeUrl in youtubeHowToUseUrls" :key="youtubeUrl"
            width="100%" height="315" :src="youtubeUrl" frameborder="0"
            allow="accelerometer; encrypted-media; gyroscope;" allowfullscreen
            class="youtube"
          />
        </section>
        <section>
          <h3>Manténgase en contacto con nosotros</h3>
          <p>
            ¡Nos encantaría saber lo que piensa! Si tiene comentarios o preguntas sobre
            el Compass, puede contactar a DataWorks en general a través de
            <ExternalLink href="https://dataworks-nc.org/contact/">
              https://dataworks-nc.org/contact/
            </ExternalLink> y seguirnos en <ExternalLink href="https://twitter.com/DataWorks_NC">
              Twitter en @DataWorks_NC
            </ExternalLink>.
          </p>
          <p v-if="mailchimpUrl">
            Para obtener novedades sobre el Compass y DataWorks, suscríbase a nuestra
            lista de correo:
          </p>
          <MailchimpSignup :url="mailchimpUrl" />
        </section>
        <section>
          <h3>Créditos</h3>
          <p>
            El Compass es mantenido por
            <ExternalLink href="https://dataworks-nc.org">
              DataWorks NC
            </ExternalLink>
            y
            <ExternalLink href="https://rad.cat">
              Research Action Design
            </ExternalLink>
            para la ciudad y condado de Durham, NC.
          </p>
          <p>
            El código original para construirlo está basado en el utilizado en el
            <ExternalLink href="https://mcmap.org/qol/">
              Mecklenburg Quality of Life
              Dashboard
            </ExternalLink>
            , desarrollado por Tobin Bradley para el condado de Mecklenburg, NC.
          </p>
          <p>
            <ExternalLink href="http://tilde.coop/">
              tilde Cooperativa de Justicia de
              Lenguaje
            </ExternalLink>
            lidera la estrategia multilingüe para el Compass, con traducciones de <ExternalLink href="https://paperplanetranslations.com/">
              Paper Plane Translations
            </ExternalLink>.
          </p>
          <p>
            <ExternalLink href="https://github.com/annetee">
              Anne Tomasevich
            </ExternalLink>
            y
            <ExternalLink href="https://github.com/alexmanzo">
              Alex Manzo
            </ExternalLink>
            también han proporcionado ayuda en el diseño y desarrollo.
          </p>
          <p>
            <ExternalLink href="https://browserstack.com">
              BrowserStack
            </ExternalLink>
            y
            <ExternalLink href="https://happo.io">
              Happo.io
            </ExternalLink>
            nos han otorgado créditos de código abierto y gratuito para el proyecto.
            También dependemos mucho de
            <ExternalLink href="https://circleci.com/">
              CircleCI
            </ExternalLink>
            . El Compass está desarrollado con VueJS, utilizando Vuetify, MapboxGL JS, y
            Chartist.
          </p>
          <p>
            Gracias a los numerosos residentes de Durham que nos han ayudado a través
            de su asistencia a los talleres de consenso, pruebas de usabilidad o eventos
            de DataWorks.
          </p>
        </section>
        <section>
          <h3>Recursos</h3>
          <p>
            Otras fuentes de datos
            <ul>
              <li>
                <ExternalLink href="https://live-durhamnc.opendata.arcgis.com/">
                  Portal de
                  información abierta de la ciudad de Durham
                </ExternalLink>
                (en inglés) - El portal de información de Durham le permite descargar una variedad de
                conjuntos de datos sobre la ciudad y el condado.
              </li>
              <li>
                <ExternalLink href="https://www.census.gov/">
                  Censo de los EE.UU.
                </ExternalLink>
                (en inglés) - La fuente de mucha de la información del Neighborhood Compass.
              </li>
              <li>
                <ExternalLink href="https://www.nhgis.org/">
                  Sistema de información
                  geográfica histórica nacional
                </ExternalLink>
                (en inglés) - Este sitio compila información histórica del censo para todo Estados
                Unidos, desde 1790 al presente. Atención: se requiere registrarse.
              </li>
              <li>
                <ExternalLink href="https://www.nconemap.gov/">
                  NC OneMap
                </ExternalLink>
                (en inglés) - Centro de referencia de información geográfica de todo el estado.
              </li>
            </ul>
          </p>
          <p>
            Sobre Durham
            <ul>
              <li>
                <ExternalLink href="https://health.dataworks-nc.org/es">
                  Proyecto de
                  indicadores de salud
                </ExternalLink>
                - Información sobre resultados y factores determinantes de salud a nivel
                vecinal en Durham.
              </li>
              <li>
                <ExternalLink href="https://dataworks-nc.org/evictions/">
                  Desalojos en
                  Durham
                </ExternalLink>
                (en inglés) - El sitio de DataWorks con información detallada sobre desalojos.
              </li>
              <li>
                <ExternalLink href="https://www.bullcity150.org/uneven_ground/">
                  Uneven
                  Ground
                </ExternalLink>
                (en inglés) - Exhibición en línea sobre la historia de la vivienda en Durham.
              </li>
              <li>
                <ExternalLink href="http://www.durhamhoods.com/">
                  Durham Hoods
                </ExternalLink>
                (en inglés) - Este sitio agrupa las listas de correo de los vecindarios y tiene un
                mapa de los mismos. Nótese que los mapas de los vecindarios presentan
                algunas inexactitudes.
              </li>
              <li>
                <ExternalLink href="http://www.opendurham.org/">
                  Open Durham
                </ExternalLink>
                (en inglés) - Compendio de la información histórica sobre los vecindarios y los
                edificios de Durham.
              </li>
            </ul>
          </p>
        </section>
      </div>
      <div v-else>
        <section>
          <h2>Are you interested in what’s changing in your community?</h2>
          <p>Durham is changing so fast and it’s sometimes hard to know how and where. What we hear and see is oftentimes part of larger trends occurring and these actually link neighbors across the City - folks who may not yet know one another but share aspirations and face similar struggles. Even with news and social media, personal networks and church, and the old-fashioned grapevine there is still a lot we can learn about the bigger picture.</p>
          <p>Welcome to Durham’s Neighborhood Compass, a place for investigating those bigger pictures in our community and sharing what you learn.</p>
          <p>
            The Neighborhood Compass is a primary community resource that allows you to track changes in your community with data; regularly-updated information that often deepens your gut-level understanding that the character of Durham’s neighborhoods is changing.
          </p>
          <p>
            Each year the Compass grows and learns along with its users, adding data sets with strong community resonance and long-term importance -- it’s a quantitative project with qualitative values.
          </p>
        </section>
        <section>
          <h3>
            How to cite the compass
          </h3>
          <p>
            We encourage you to use data from the Durham Neighborhood Compass in your own work. Please credit DataWorks NC and the Durham Neighborhood Compass when you do so, and be sure to cite both the name of the dataset you are accessing as well as the relevant year.
          </p>
          <p>An example citation, in MLA format, is:</p>
          <blockquote>
            DataWorks NC. “Chronic Kidney Disease (Adult Population), 2017.” <em>Durham Neighborhood Compass</em>, compass.durhamnc.gov/en/compass/CKD_TOTAL/tract. Accessed 19 Feb. 2020.
          </blockquote>
        </section>
        <section>
          <h3>How to use this site</h3>
          <p>To learn more about how to use the Compass, check out the video tutorials from DataWorks' fall 2019 student interns, Sydney and Jesse.</p>
          <iframe
            v-for="youtubeUrl in youtubeHowToUseUrls" :key="youtubeUrl"
            width="100%" height="315" :src="youtubeUrl" frameborder="0"
            allow="accelerometer; encrypted-media; gyroscope;" allowfullscreen
            class="youtube"
          />
        </section>
        <section>
          <h3>
            Get in touch with us
          </h3>
          <p>
            We’d love to hear from you! If you have thoughts or questions about the Compass, <ExternalLink :href="siteConfig.feedbackUrl">
              click here to share your feedback
            </ExternalLink>. You can also contact DataWorks generally at
            <ExternalLink href="https://dataworks-nc.org/contact/">
              https://dataworks-nc.org/contact/
            </ExternalLink> and follow us on Twitter at <ExternalLink href="https://twitter.com/DataWorks_NC">
              @DataWorks_NC
            </ExternalLink>.
          </p>
          <p v-if="mailchimpUrl">
            For updates about the Compass and DataWorks, sign up for our mailing list:
          </p>
          <MailchimpSignup :url="mailchimpUrl" />
        </section>
        <section>
          <h3>
            Credits
          </h3>
          <p>
            The Compass is maintained by
            <ExternalLink href="https://dataworks-nc.org">
              DataWorks NC
            </ExternalLink>
            and
            <ExternalLink href="https://rad.cat">
              Research Action Design
            </ExternalLink>
            for the City and County of Durham, NC.
          </p>
          <p>
            The original source code for the Compass is based off of the
            <ExternalLink href="https://mcmap.org/qol/">
              Mecklenburg Quality of Life Dashboard
            </ExternalLink>, developed by Tobin Bradley for Mecklenburg County, NC.
          </p>
          <p>
            <ExternalLink href="http://tilde.coop/">
              tilde Language Justice Cooperative
            </ExternalLink>
            leads multilingual strategy for the Compass, with translations by <ExternalLink href="https://paperplanetranslations.com/">
              Paper Plane Translations
            </ExternalLink>.
          </p>
          <p>
            <ExternalLink href="https://github.com/annetee">
              Anne Tomasevich
            </ExternalLink>
            and
            <ExternalLink href="https://github.com/alexmanzo">
              Alex Manzo
            </ExternalLink>
            have also provided design & development support.
          </p>
          <p>
            <ExternalLink href="https://browserstack.com">
              BrowserStack
            </ExternalLink>
            and
            <ExternalLink href="https://happo.io">
              Happo.io
            </ExternalLink>
            have both provided free open-source credits to the project. We also rely heavily on                         También dependemos mucho de
            <ExternalLink href="https://circleci.com/">
              CircleCI
            </ExternalLink>. The Compass is built on VueJS, using Vuetify, MapboxGL JS, and Chartist.
          </p>
          <p>
            Thanks also to the many Durham residents who have helped out through attending consensus workshops, usability testing sessions, or DataWorks events.
          </p>
        </section>
        <section>
          <h3>
            Resources
          </h3>
          <p>
            Other data sources
            <ul>
              <li>
                <ExternalLink href="https://live-durhamnc.opendata.arcgis.com/">
                  City of Durham Open Data Portal
                </ExternalLink>
                - Durham’s data portal allows you to download a variety of city and county datasets.
              </li>
              <li>
                <ExternalLink href="https://www.census.gov/">
                  US Census
                </ExternalLink>
                - The source for much of the Neighborhood Compass data.
              </li>
              <li>
                <ExternalLink href="https://www.nhgis.org/">
                  National Historical Geographic Information System
                </ExternalLink>
                - This site aggregates historical census data for the entire United States, 1790 to the present. Note: registration is required.
              </li>
              <li>
                <ExternalLink href="https://www.nconemap.gov/">
                  NC OneMap
                </ExternalLink>
                - State-wide clearinghouse for geographic data.
              </li>
            </ul>
          </p>
          <p>
            About Durham
            <ul>
              <li>
                <ExternalLink href="https://health.dataworks-nc.org/">
                  Health Indicators Project
                </ExternalLink>
                - Information about health outcomes and determinants at the neighborhood level for Durham.
              </li>
              <li>
                <ExternalLink href="https://dataworks-nc.org/evictions/">
                  Evictions in Durham
                </ExternalLink>
                - DataWorks’ site with more detailed information about evictions.
              </li>
              <li>
                <ExternalLink href="https://www.bullcity150.org/uneven_ground/">
                  Uneven
                  Ground
                </ExternalLink>
                Online exhibit about the history of housing in Durham.
              </li>
              <li>
                <ExternalLink href="http://www.durhamhoods.com/">
                  Durham Hoods
                </ExternalLink>
                - This site aggregates neighborhood mailing lists and has a map of Durham neighborhoods. Note that the neighborhood map contains some inaccuracies.
              </li>
              <li>
                <ExternalLink href="http://www.opendurham.org/">
                  Open Durham
                </ExternalLink>
                - Compendium of historical information about Durham’s neighborhoods and buildings.
              </li>
            </ul>
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<script>
import handleLinksMixin from '@/js/components/mixins/handleLinksMixin.js';
import MailchimpSignup from '@/js/components/mailchimp-signup.vue';
import ExternalLink from '@/js/components/external-link.vue';
import config from '@/js/modules/config.js';

export default {
  name: 'AboutContents',
  components: {
    MailchimpSignup,
    ExternalLink,
  },
  mixins: [handleLinksMixin,],
  data() {
    return {
      siteConfig: config.siteConfig,
      mailchimpUrl: config.privateConfig.mailchimpUrl,
      youtubeHowToUseUrls: [
        'https://www.youtube.com/embed/_kgXqqjDsFA',
        'https://www.youtube.com/embed/e3nPdpHPpBc'],
    };
  },
};
</script>
