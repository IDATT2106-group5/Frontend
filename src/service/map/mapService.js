import L from 'leaflet';
import BaseService from '@/service/baseService';

class MapService extends BaseService {
  constructor() {
    super('map-icons');
  }

  createMap(container, options = {}) {
    const defaultOptions = {
      center: [63.4305, 10.3951],
      zoom: 13,
      zoomControl: false
    };

    const map = L.map(container, { ...defaultOptions, ...options });

    // Zoom control
    L.control.zoom({
      position: 'bottomright'
    }).addTo(map);

    return map;
  }

  invalidateMapSize(map) {
    if (map) {
      map.invalidateSize();
    }
  }
}

export default new MapService();
