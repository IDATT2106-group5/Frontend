// service/map/geocodingService.js
import axios from 'axios';

/**
 * Service for geocoding addresses and searching places
 */
class GeocodingService {
  /**
   * Search for places and addresses
   * @param {string} query - The search term
   * @param {Object} options - Search options
   * @param {number} options.limit - Max number of results (default: 5)
   * @param {string} options.countryCode - Limit search to country (default: 'no' for Norway)
   * @returns {Promise<Array>} Array of search results
   */
  async searchPlaces(query, options = {}) {
    if (!query || query.trim() === '') {
      return [];
    }

    const defaultOptions = {
      limit: 5,
      countryCode: 'no'
    };

    const searchOptions = { ...defaultOptions, ...options };

    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: query,
          format: 'json',
          addressdetails: 1,
          limit: searchOptions.limit,
          countrycodes: searchOptions.countryCode
        },
        headers: {
          // Important: Include User-Agent header for Nominatim API
          'User-Agent': 'EmergencyMapApplication'
        }
      });

      // Process and transform results
      return this.transformSearchResults(response.data);
    } catch (error) {
      console.error('Error searching places:', error);
      throw new Error('Failed to search places. Please try again later.');
    }
  }

  /**
   * Transform API results to a more usable format
   * @param {Array} results - Raw API results
   * @returns {Array} Transformed results
   */
  transformSearchResults(results) {
    if (!Array.isArray(results)) {
      return [];
    }

    return results.map(result => ({
      id: result.place_id,
      name: result.display_name,
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      type: result.type,
      address: result.address,
      importance: result.importance,
      boundingBox: result.boundingbox
    }));
  }

  /**
   * Get address details from coordinates
   * @param {number} lat - Latitude
   * @param {number} lng - Longitude
   * @returns {Promise<Object>} Address details
   */
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
        params: {
          lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'EmergencyMapApplication'
        }
      });

      return {
        id: response.data.place_id,
        name: response.data.display_name,
        address: response.data.address,
        lat,
        lng
      };
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      throw new Error('Failed to get address from coordinates.');
    }
  }
}

// Create and export a single instance
const geocodingService = new GeocodingService();
export default geocodingService;
