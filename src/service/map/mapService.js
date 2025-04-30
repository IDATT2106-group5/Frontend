import L from 'leaflet';

export default {
  createMap(container, options = {}) {
    const defaultOptions = {
      center: [63.4305, 10.3951],
      zoom: 13,
      zoomControl: false
    };

    const map = L.map(container, { ...defaultOptions, ...options });

    // Add zoom control
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    return map;
  },

  invalidateMapSize(map) {
    if (map) {
      map.invalidateSize();
    }
  }
};
