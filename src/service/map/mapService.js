import L from 'leaflet'

/**
 * Service that handles Leaflet map operations
 */
class MapService {
  constructor() {
    this.layers = this._initializeLayers();
  }

  /**
   * Creates and configures a Leaflet map instance
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

    return L.map(container, { ...defaultOptions, ...options });
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

  /**
   * Sets the active base layer on the map
   * @param {L.Map} map - The map instance
   * @param {string} layerId - ID of the layer to activate
   * @returns {L.TileLayer|null} The activated layer or null
   */
  setActiveLayer(map, layerId) {
    if (!map) return null;

    const definitions = this.getLayerDefinitions();
    const options = this.getLayerOptions();

    // Remove existing base layers
    Object.values(definitions).forEach(layerDef => {
      if (layerDef.base && map.hasLayer(layerDef.base)) {
        map.removeLayer(layerDef.base);
      }
    });

    // Find the requested layer option
    const layerOption = options.find(option => option.id === layerId);
    if (!layerOption) return null;

    // Get the provider and the layer
    const provider = layerOption.provider;
    const layer = definitions[provider]?.base;

    // Add layer to map if found
    if (layer) {
      layer.addTo(map);
      return layer;
    }

    return null;
  }

  /**
   * Gets layer definition objects for all available base layers
   * @returns {Object} Map of layer definitions
   */
  getLayerDefinitions() {
    return this.layers.definitions;
  }

  /**
   * Gets UI configuration options for available map layers
   * @returns {Array} Layer options for UI presentation
   */
  getLayerOptions() {
    return this.layers.options;
  }

  /**
   * Initializes the available map layers
   * @private
   * @returns {Object} Layer configurations
   */
  _initializeLayers() {
    return {
      // Layer definitions with actual Leaflet layers
      definitions: {
        standard: {
          base: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          })
        },
        satellite: {
          base: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            maxZoom: 19,
            attribution: '&copy; ESRI'
          })
        },
        terrain: {
          base: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            maxZoom: 17,
            attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
          })
        }
      },

      // UI options for the layers
      options: [
        {
          id: 'standard',
          name: 'Trafikk',
          provider: 'standard'
        },
        {
          id: 'satellite',
          name: 'Satellitt',
          provider: 'satellite'
        },
        {
          id: 'terrain',
          name: 'Terreng',
          provider: 'terrain'
        }
      ]
    };
  }
}

export default new MapService();
