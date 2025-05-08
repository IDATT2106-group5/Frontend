import L from 'leaflet'

/**
 * Service that handles Leaflet map operations
 */
class MapService {
  /**
   * Creates and configures a Leaflet map instance with the standard OSM layer
   * @param {HTMLElement} container - DOM element to contain the map
   * @param {Object} options - Custom map options
   * @returns {L.Map} The created map instance
   */
  createMap(container, options = {}) {
    const defaultOptions = {
      center: [63.4305, 10.3951],
      zoom: 13,
      zoomControl: false
    };

    const map = L.map(container, { ...defaultOptions, ...options });

    // Add the standard OSM layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    return map;
  }

  /**
   * Updates the map size when container dimensions change
   * @param {L.Map} map - The map instance
   */
  invalidateMapSize(map) {
    if (map) {
      map.invalidateSize();
    }
  }

  /**
   * Sets up a debounced event listener for map movement
   * @param {L.Map} map - The map instance
   * @param {Function} callback - Function to call when map movement ends
   * @param {number} debounceMs - Debounce time in milliseconds
   * @returns {Function} Cleanup function to remove listener
   */
  setupMapMoveListener(map, callback, debounceMs = 500) {
    if (!map) return null;

    let timer = null;

    const handleMoveEnd = () => {
      if (timer) {
        clearTimeout(timer);
      }

      timer = setTimeout(() => {
        callback();
      }, debounceMs);
    };

    map.on('moveend', handleMoveEnd);

    // Return cleanup function
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
      map.off('moveend', handleMoveEnd);
    };
  }

  /**
   * Gets the current visible bounds of the map
   * @param {L.Map} map - The map instance
   * @returns {L.LatLngBounds|null} The current map bounds or null
   */
  getMapBounds(map) {
    if (!map) return null;
    return map.getBounds();
  }

  /**
   * Properly cleans up a map instance
   * @param {L.Map} map - The map instance to clean up
   */
  cleanupMap(map) {
    if (!map) return;

    map.off(); // Remove all event listeners
    map.remove(); // Remove map from DOM
  }
}

export default new MapService();
