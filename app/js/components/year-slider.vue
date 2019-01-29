<template lang="html">
  <div v-if="metric && metric.years.length > 1" id="years" >
    <div class="flex-container">
      <div class="flex-left">
        <div class="playpause">
          <input id="playpause" type="checkbox" value="None" name="check" checked title="Start or stop playing through data timeseries by year" @change="play">
          <label for="playpause"/>
        </div>
      </div>
      <div v-if="metric.years.length > 1" class="flex-center yearslider">
        <input id="yearslider" :min="metric.years[0]" :max="metric.years[metric.years.length - 1]"
               :value="year" type="range"
               step="1" list="ticks" @change="changeYear">
        <datalist id="ticks">
          <option v-for="tickYear in metric.years">
            {{ tickYear }}
          </option>
        </datalist>
      </div>
      <div class="flex-right">
        <h3>{{ year }}</h3>
      </div>
    </div>
    <div class="flex-container">
      <label for="yearslider">use slider to choose a data year to view</label>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex';

export default {
  name: 'YearSlider',
  computed: mapState(['metric', 'year']),
  methods: {
    changeYear(event) {
      const closest = this.getClosest(this.metric.years, event.target.value);
      this.$store.commit('setYear', closest);
      event.target.value = closest;
    },
    getClosest(arr, val) {
      return arr.reduce((prev, curr) => (Math.abs(curr - val) < Math.abs(prev - val) ? curr : prev));
    },
    play(event) {
      if (!event.target.checked) {
        this.$store.dispatch('playYearAnimation');
      } else {
        this.$store.dispatch('stopYearAnimation');
      }
    },
  },
};
</script>

<style lang="css" scoped>
#years {
    color: #262626;
    padding: 5px;
    display: inline-block;
    width: 100%;
}
.flex-container {
    display: flex;
    align-items: center;
}
.flex-left, .flex-right {
    width: 20px;
}
.flex-center {
    flex-grow: 1;
    padding: 0 10px;
}
#yearslider {
    width: 100%;
}
h3 {
    margin: 0;
    font-size: 1.1em;
}

.playpause label {
    display: block;
    box-sizing: border-box;
    width: 0;
    height: 34px;
    border-color: transparent transparent transparent rgb(158, 158, 158);
    transition: 180ms all ease;
    cursor: pointer;
    border-style: double;
    border-width: 0 0 0 25px;
}
.playpause label:hover {
    border-color: transparent transparent transparent #00688B;
}
.playpause input[type="checkbox"] {
    display: none;
}
.playpause input[type="checkbox"]:checked + label {
    border-style: solid;
    border-width: 17px 0 17px 25px;
}

#years label {
    width: 100%;
    text-align: center;
    color: rgb(158, 158, 158);
    font-weight: normal;
}
</style>
