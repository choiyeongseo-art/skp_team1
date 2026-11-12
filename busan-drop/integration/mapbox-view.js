/* Shared camera presets for home and store finder. */
window.BUSAN_MAPBOX_VIEWS={
  BUSAN:{center:[129.0756,35.1796],zoom:10},
  서면:{center:[129.0595,35.1579],zoom:13.5},
  남포동:{center:[129.0327,35.0985],zoom:13.5},
  광안리:{center:[129.1186,35.1532],zoom:13.5},
  해운대:{center:[129.1604,35.1587],zoom:13.5}
};

/* Home tabs cover the full city/district, rather than a shopping street.
 * Viewport extents derived from KOSTAT 2013 simplified municipal geometry:
 * https://github.com/southkorea/southkorea-maps/blob/master/kostat/2013/json/skorea_municipalities_geo_simple.json
 * These are camera extents, not displayed legal boundary polygons.
 */
window.BUSAN_HOME_MAPBOX_VIEWS={
  BUSAN:{district:'부산 전체',bounds:[[128.795856,35.009785],[129.306815,35.384811]]},
  서면:{district:'부산진구',bounds:[[129.011984,35.130937],[129.085194,35.195309]]},
  남포동:{district:'중구',bounds:[[129.028391,35.091574],[129.044989,35.11369]]},
  광안리:{district:'수영구',bounds:[[129.097087,35.132391],[129.134720,35.184750]]},
  해운대:{district:'해운대구',bounds:[[129.112306,35.144628],[129.210196,35.247653]]}
};

window.BUSAN_BASEMAP_STYLE = 'mapbox://styles/mapbox/streets-v12';

window.BUSAN_STYLE_MAP = function styleMap(map) {
  map.on('style.load', () => {
    if (map.getLayer('water')) {
      map.setPaintProperty('water', 'fill-color', '#92d7e9');
    }
  });
};
