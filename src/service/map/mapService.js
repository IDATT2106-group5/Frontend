import L from 'leaflet';
import BaseService from '@/service/baseService';

class MapService extends BaseService {
  constructor() {
    super('maps'); // Use your actual API endpoint for maps
  }

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
  }

  invalidateMapSize(map) {
    if (map) {
      map.invalidateSize();
    }
  }

  async fetchMarkers() {
    try {
      // This will call the GET method from BaseService
      // E.g., GET /maps/markers
      return await this.get('markers');
    } catch (error) {
      console.error('Error fetching markers:', error);
      return [];
    }
  }

  async createMarker(markerData) {
    try {
      // This will call the POST method from BaseService
      // E.g., POST /maps/markers with markerData
      return await this.post('markers', markerData);
    } catch (error) {
      console.error('Error creating marker:', error);
      throw error;
    }
  }

  async updateMarker(markerId, markerData) {
    try {
      // This will call the PUT method from BaseService
      // E.g., PUT /maps/markers/123 with markerData
      return await this.put(`markers/${markerId}`, markerData);
    } catch (error) {
      console.error('Error updating marker:', error);
      throw error;
    }
  }

  async deleteMarker(markerId) {
    try {
      // This will call the DELETE method from BaseService
      // E.g., DELETE /maps/markers/123
      return await this.deleteItem(`markers/${markerId}`);
    } catch (error) {
      console.error('Error deleting marker:', error);
      throw error;
    }
  }
}

export default new MapService();
