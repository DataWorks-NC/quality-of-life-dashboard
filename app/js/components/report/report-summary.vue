<template>
    <div class="container">
        <div class="page page-front">
            <div class="row">
                <div class="col-xs-12">
                    <div class="hero">
                        <img class="logo-image" src="images/report-logo.png">
                        <div class="subhero">
                            <h4 class="neighborhoods">Blah de blah</h4>
                        </div>
                    </div>
                </div>
            </div>
    <div class="row">
        <div class="col-xs-6">
            <p>
                The <a href="/">Neighborhood Compass</a> is a primary community resource for information that is regularly-updated, serving meaningful data to the community openly.
            </p>
            <p>
                Each year the Compass grows and learns along with its users, adding data sets with strong community resonance and longitudinal importance.
            </p>
            <p>
                A quantitative project with qualitative values.
            </p>
        </div>
        <div class="col-xs-6 text-right">
            <div id="smallmap" class="pull-right"></div>
        </div>
    </div>
    <div class="row" id="metric-summary-box">
        <div class="col-xs-12 text-center">
            <table class="metric-box">
                <tbody>
                <tr>
                <td v-for="metric in privateState.summaryMetrics.slice(0,3)">
                    <h2>{{ metric.category }}</h2>
                    <h3>{{ metric.value }} {{ metric.raw_label }}</h3>
                    <h4>{{ metric.title }}</h4>
                </td>
                </tr>
                <tr>
                    <td v-for="metric in privateState.summaryMetrics.slice(3,6)">
                        <h2>{{ metric.category }}</h2>
                        <h3>{{ metric.value }} {{ metric.raw_label }}</h3>
                        <h4>{{ metric.title }}</h4>
                    </td>
                </tr>
                </tbody>
            </table>
        </div>
    </div>
    </div>
    </div>
</template>

<script>
  export default {
    name: 'report-summary',
  };
</script>

<style scoped>

</style>