// service/map/markerService.js
import BaseService from '@/service/baseService';

class MarkerService extends BaseService {
  constructor() {
    super('map-icons');
  }

  // Default map coordinates - Trondheim, Norway
  defaultLat = 63.4305;
  defaultLng = 10.3951;
  defaultRadius = 10; // 10 km radius if no map bounds

  // Calculate distance between two points in km (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Calculate radius in km based on map bounds
  calculateRadiusFromBounds(bounds) {
    if (!bounds) {
      return this.defaultRadius;
    }

    // Get the center of the map
    const center = bounds.getCenter();

    // Get the northeast corner of the bounds
    const northEast = bounds.getNorthEast();

    // Calculate the distance from center to the corner (in km)
    const radius = this.calculateDistance(
      center.lat, center.lng,
      northEast.lat, northEast.lng
    );

    // Add some buffer (20%) to ensure we get all markers in view
    return radius * 1.2;
  }

  // API methods for fetching markers
  async fetchAllMarkers(mapBounds) {
    try {
      // Get the center and radius from map bounds or use defaults
      let latitude, longitude, radiusKm;

      if (mapBounds) {
        const center = mapBounds.getCenter();
        latitude = center.lat;
        longitude = center.lng;
        radiusKm = this.calculateRadiusFromBounds(mapBounds);
      } else {
        latitude = this.defaultLat;
        longitude = this.defaultLng;
        radiusKm = this.defaultRadius;
      }

      console.log(`Fetching markers from: ${this.buildUrl('')} with dynamic params:`, {
        latitude,
        longitude,
        radiusKm: Math.round(radiusKm * 10) / 10 // Round to 1 decimal place
      });

      // Get with dynamic parameters
      const response = await this.get('', {
        params: {
          latitude,
          longitude,
          radiusKm: Math.round(radiusKm * 10) / 10 // Round to 1 decimal place
        }
      });

      // Ensure we have a response
      if (!response || !Array.isArray(response)) {
        console.warn('API returned invalid response format:', response);
        throw new Error('Invalid API response format');
      }

      // Process the response and organize by marker type
      const markersByType = {};

      // Process API response
      response.forEach(marker => {
        if (!marker.type) {
          console.warn('Marker missing type property:', marker);
          return;
        }

        if (!markersByType[marker.type]) {
          markersByType[marker.type] = [];
        }

        markersByType[marker.type].push({
          id: marker.id,
          name: marker.name || '',
          address: marker.address || '',
          lat: marker.latitude,
          lng: marker.longitude,
          description: marker.description || '',
          opening_hours: marker.openingHours || '',
          contact_info: marker.contactInfo || ''
        });
      });

      console.log(`Loaded ${response.length} markers for radius ${radiusKm.toFixed(1)} km`);
      return markersByType;
    } catch (error) {
      console.error('Error fetching all markers:', error);
      throw error; // Re-throw to let caller handle the error
    }
  }

  /**
   * Find the closest marker of a specific type
   * @param {number} lat - User's current latitude
   * @param {number} lng - User's current longitude
   * @param {string} type - Optional marker type (e.g., 'SHELTER')
   * @returns {Promise<Object>} - The closest marker data
   */
  async findClosestMarker(lat, lng, type = null) {
    try {
      const params = {
        latitude: lat,
        longitude: lng
      };

      if (type) {
        params.type = type;
      }

      const response = await this.get('/closest', { params });

      if (response) {
        // Transform response to match marker format expected by the UI
        return {
          id: response.id,
          name: iconConfig[response.type]?.norwegianName || '',
          address: response.address || '',
          lat: response.latitude,
          lng: response.longitude,
          description: response.description || '',
          opening_hours: response.openingHours || '',
          contact_info: response.contactInfo || '',
          type: response.type,
          distance: this.calculateDistance(lat, lng, response.latitude, response.longitude)
        };
      }
      return null;
    } catch (error) {
      console.error('Error finding closest marker:', error);
      throw error;
    }
  }
}

export default new MarkerService();
