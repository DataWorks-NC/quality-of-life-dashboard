/**
 * Chartist.js plugin to display a data label on top of the points in a line chart.
 *
 */

import '@/scss/modules/chartist-tooltips.css';

import {BarChart, PieChart} from 'chartist';

function show(element) {
  if (!hasClass(element, 'tooltip-show')) {
    element.className = element.className + ' tooltip-show';
  }
}

function hide(element) {
  var regex = new RegExp('tooltip-show' + '\\s*', 'gi');
  element.className = element.className.replace(regex, '').trim();
}

function hasClass(element, className) {
  return (' ' + element.getAttribute('class') + ' ').indexOf(' ' + className + ' ') > -1;
}

function next(element, className) {
  do {
    element = element.nextSibling;
  } while (element && !hasClass(element, className));
  return element;
}

function text(element) {
  return element.innerText || element.textContent;
}

const defaultOptions = {
  currency: undefined,
  currencyFormatCallback: undefined,
  tooltipOffset: {
    x: 0,
    y: -20,
  },
  anchorToPoint: false,
  appendToBody: false,
  class: undefined,
  pointClass: 'ct-point',
};

const ctTooltip = (userOptions = {}) => ((chart) => {
  const options = {...defaultOptions, ...userOptions};

  let tooltipSelector = options.pointClass;
  if (chart.constructor.name == BarChart.prototype.constructor.name) {
    tooltipSelector = 'ct-BarChart';
  } else if (chart.constructor.name == PieChart.prototype.constructor.name) {
    // Added support for donut graph
    if (chart.options.donut) {
      // Added support or SOLID donut graph
      tooltipSelector = chart.options.donutSolid ? 'ct-slice-donut-solid' : 'ct-slice-donut';
    } else {
      tooltipSelector = 'ct-slice-PieChart';
    }
  }

  const $chart = chart.container;
  let $toolTip = $chart.querySelector('.chartist-tooltip');
  if (!$toolTip) {
    $toolTip = document.createElement('div');
    $toolTip.className = (!options.class) ?
      'chartist-tooltip' :
      'chartist-tooltip ' + options.class;
    if (!options.appendToBody) {
      $chart.appendChild($toolTip);
    } else {
      document.body.appendChild($toolTip);
    }
  }
  let height = $toolTip.offsetHeight;
  let width = $toolTip.offsetWidth;

  hide($toolTip);

  function on(event, selector, callback) {
    $chart.addEventListener(event, function(e) {
      if (!selector || hasClass(e.target, selector))
        callback(e);
    });
  }

  on('mouseover', tooltipSelector, function(event) {
    const $point = event.target;
    let tooltipText = '';

    const isPieChart = (chart instanceof PieChart) ? $point : $point.parentNode;
    const seriesName = (isPieChart) ?
      $point.parentNode.getAttribute('ct:meta') ||
      $point.parentNode.getAttribute('ct:series-name') :
      '';

    let meta = $point.getAttribute('ct:meta') || seriesName || '';
    const hasMeta = !!meta;
    let value = $point.getAttribute('ct:value');

    if (options.transformTooltipTextFnc && typeof options.transformTooltipTextFnc === 'function') {
      value = options.transformTooltipTextFnc(value);
    }

    if (options.tooltipFnc && typeof options.tooltipFnc === 'function') {
      tooltipText = options.tooltipFnc(meta, value);
    } else {
      if (options.metaIsHTML) {
        var txt = document.createElement('textarea');
        txt.innerHTML = meta;
        meta = txt.value;
      }

      meta = '<span class="chartist-tooltip-meta">' + meta + '</span>';

      if (hasMeta) {
        tooltipText += meta + '<br>';
      } else {
        // For PieChart Charts also take the labels into account
        // Could add support for more charts here as well!
        if (chart instanceof PieChart) {
          var label = next($point, 'ct-label');
          if (label) {
            tooltipText += text(label) + '<br>';
          }
        }
      }

      if (value) {
        if (options.currency) {
          if ('currencyFormatCallback' in options) {
            value = options.currencyFormatCallback(value, options);
          } else {
            value = options.currency + value.replace(/(\d)(?=(\d{3})+(?:\.\d+)?$)/g, '$1,');
          }
        }
        value = '<span class="chartist-tooltip-value">' + value + '</span>';
        tooltipText += value;
      }
    }

    if (tooltipText) {
      $toolTip.innerHTML = tooltipText;
      setPosition(event);


      // TIM addition.
      const seriesClasses = [...$point.parentNode.classList].filter(c => c !== 'ct-series');
      $toolTip.className ='chartist-tooltip ' + seriesClasses.join(' ');
      // END TIM addition.

      show($toolTip);

      // Remember height and width to avoid wrong position in IE
      height = $toolTip.offsetHeight;
      width = $toolTip.offsetWidth;
    }
  });

  on('mouseout', tooltipSelector, function() {
    hide($toolTip);
  });

  on('mousemove', null, function(event) {
    if (false === options.anchorToPoint)
      setPosition(event);
  });

  function setPosition(event) {
    height = height || $toolTip.offsetHeight;
    width = width || $toolTip.offsetWidth;
    const offsetX = -width / 2 + options.tooltipOffset.x;
    const offsetY = -height + options.tooltipOffset.y;
    let anchorX, anchorY;

    if (!options.appendToBody) {
      const box = $chart.getBoundingClientRect();
      const left = event.pageX - box.left - window.pageXOffset;
      const top = event.pageY - box.top - window.pageYOffset;

      if (true === options.anchorToPoint && event.target.x2 && event.target.y2) {
        anchorX = parseInt(event.target.x2.baseVal.value);
        anchorY = parseInt(event.target.y2.baseVal.value);
      }

      $toolTip.style.top = (anchorY || top) + offsetY + 'px';
      $toolTip.style.left = (anchorX || left) + offsetX + 'px';
    } else {
      $toolTip.style.top = event.pageY + offsetY + 'px';
      $toolTip.style.left = event.pageX + offsetX + 'px';
    }
  }
});

export {ctTooltip};
