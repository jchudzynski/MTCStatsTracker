import * as $ from 'jquery';
import 'jvectormap';
import 'jvectormap/jquery-jvectormap.css';
import './jquery-jvectormap-world-mill.js';
import './jquery-jvectormap-us-aea.js';
import { debounce } from 'lodash';

export default (function () {
  const vectorMapInit = () => {
    if ($('#world-map-marker').length > 0) {
      // This is a hack, as the .empty() did not do the work
      $('#vmap').remove();
      $('#usamap').remove();
      // we recreate (after removing it) the container div, to reset all the data of the map
      $('#world-map-marker').append(`
        <div
          id="vmap"
          style="
            height: 490px;
            position: relative;
            overflow: hidden;
            background-color: transparent;
          "
        >
        </div>
      `);

      $('#usa-map-marker').append(`
        <div
          id="usamap"
          style="
            height: 490px;
            position: relative;
            overflow: hidden;
            background-color: transparent;
          "
        >
        </div>
      `);

      let countries = { 'AR':100,'BO':100, 'CL':100, 'CO':100,'CR':100,
                  'CU':100, 'DO':100, 'EC':100, 'SV':100,'GT':100,'HN':100, 'MX':100,
                  'PA':100, 'PR':100,'PY':100,'PE':100,'ES':100,'UY':100,'VE':100, 'US':100}


      let states = {'US-FL':100,'US-AZ':100,'US-CO':100,'US-CT':100,'US-HI':100,
                    'US-IA':100,'US-ID':100,'US-IN':100,'US-NH':100,'US-NY':100,'US-MS':100,
                  'US-NC':100,'US-DC':100,'US-DE':100,'US-DE':100,'US-ND':100,'US-MA':100,
                'US-NJ':100,'US-TN':100,'US-MD':100 }

      var worldConfig = {
        map: 'world_mill',
        backgroundColor: '#fff',
        borderColor: '#fff',
        borderOpacity: 0.25,
        borderWidth: 0,
        color: '#e6e6e6',
        regionStyle : {
          initial : {
            fill : '#e4ecef',
          },
        },

        markerStyle: {
          initial: {
            r: 7,
            'fill': '#fff',
            'fill-opacity':1,
            'stroke': '#000',
            'stroke-width' : 2,
            'stroke-opacity': 0.4,
          },
        },
        series: {
          regions: [{
            values: countries,
            scale: ['#03a9f3', '#02a7f1'],
            normalizeFunction: 'polynomial',
          }],
        },
        hoverOpacity: null,
        normalizeFunction: 'linear',
        zoomOnScroll: false,
        scaleColors: ['#b6d6ff', '#005ace'],
        selectedColor: '#c9dfaf',
        selectedRegions: [],
        enableZoom: false,
        hoverColor: '#fff',
      };

      var usaConfig = {
        map: 'us_aea',
        backgroundColor: '#fff',
        borderColor: '#fff',
        borderOpacity: 0.25,
        borderWidth: 0,
        color: '#e6e6e6',
        regionStyle : {
          initial : {
            fill : '#e4ecef',
          },
        },

        markerStyle: {
          initial: {
            r: 7,
            'fill': '#fff',
            'fill-opacity':1,
            'stroke': '#000',
            'stroke-width' : 2,
            'stroke-opacity': 0.4,
          },
        },
        series: {
          regions: [{
            values: states,
            scale: ['#03a9f3', '#02a7f1'],
            normalizeFunction: 'polynomial',
          }],
        },
        hoverOpacity: null,
        normalizeFunction: 'linear',
        zoomOnScroll: false,
        scaleColors: ['#b6d6ff', '#005ace'],
        selectedColor: '#c9dfaf',
        selectedRegions: [],
        enableZoom: false,
        hoverColor: '#fff',
      };


      // let worldConfig = Object.assign({}, generalConfig);
      // let usaConfig = Object.assign({}, generalConfig);
      // usaConfig.map = 'us_aea'
      // usaConfig.series.regions[0].values = states
      // worldConfig.series.regions[0].values = countries


      $('#vmap').vectorMap(worldConfig);
      $('#usamap').vectorMap(usaConfig);

    }
  };

  vectorMapInit();
  $(window).resize(debounce(vectorMapInit, 150));
})();
