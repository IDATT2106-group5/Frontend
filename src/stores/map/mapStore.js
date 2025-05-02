// stores/map/mapStore.js
import { defineStore } from 'pinia';
import MapService from '@/service/map/mapService';
import MarkerService from '@/service/map/markerService';
import L from 'leaflet';

export const useMapStore = defineStore('map', {
  state: () => ({
    // Core map state
    map: null,
    activeLayerId: 'standard',

    // Marker state
    markerTypes: [],
    markerLayers: {},
    markerData: {},

    // UI state
    isLoadingMarkers: false,
    markersLoadError: null,
    initialMarkersLoaded: false,
    silentLoading: false,

    // Cleanup reference
    mapMoveCleanup: null
  }),

  getters: {
    /**
     * Get the layer options for UI
     */
    layerOptions() {
      return MapService.getLayerOptions();
    },

    /**
     * Get all layer definitions
     */
    mapLayers() {
      return MapService.getLayerDefinitions();
    },

    /**
     * Get only marker types that are currently visible
     */
    visibleMarkerTypes() {
      return this.markerTypes.filter(type => type.visible);
    },

    /**
     * Count total markers across all types
     */
    totalMarkersCount() {
      let count = 0;
      Object.values(this.markerData).forEach(markers => {
        count += markers.length;
      });
      return count;
    },

    /**
     * Check if any markers are currently visible
     */
    hasVisibleMarkers() {
      return this.markerTypes.some(type => type.visible);
    }
  },

  actions: {
    /**
     * Initialize the map and setup initial state
     * @param {HTMLElement} container - DOM element to contain the map
     * @returns {L.Map} The created map instance
     */
    initMap(container) {
      // Create the map using service
      this.map = MapService.createMap(container);

      // Set the initial active layer
      this.setActiveLayer(this.activeLayerId);

      // Initialize markers
      this.initMarkers();

      // Force a resize after initialization to handle container sizing issues
      setTimeout(() => {
        MapService.invalidateMapSize(this.map);
      }, 300);

      return this.map;
    },

    /**
     * Set up map event listeners for updating markers when the map moves
     */
    setupMapEventListeners() {
      if (!this.map) return;

      // Clean up any previous listeners
      if (this.mapMoveCleanup) {
        this.mapMoveCleanup();
        this.mapMoveCleanup = null;
      }

      // Set up debounced map move listener
      this.mapMoveCleanup = MapService.setupMapMoveListener(
        this.map,
        () => {
          // Only update markers if initial load is complete
          if (this.initialMarkersLoaded) {
            this.updateMarkersForCurrentView(true); // silent loading
          }
        },
        500 // debounce time in ms
      );
    },

    /**
     * Update markers based on current map view
     * @param {boolean} silent - Whether to show loading indicator
     */
    async updateMarkersForCurrentView(silent = false) {
      if (!this.map) return;

      // Set appropriate loading flag
      if (silent) {
        this.silentLoading = true;
      } else {
        this.isLoadingMarkers = true;
      }

      this.markersLoadError = null;

      try {
        // Get current map bounds
        const bounds = MapService.getMapBounds(this.map);

        // Fetch markers based on current view
        const newMarkerData = await MarkerService.fetchAllMarkers(bounds);

        // Update marker data
        this.markerData = newMarkerData;

        // Refresh marker layers
        this.refreshMarkerLayers();

      } catch (error) {
        console.error('Error updating markers for current view:', error);
        this.markersLoadError = 'Failed to update markers. Please try again later.';
      } finally {
        // Reset loading flags
        this.isLoadingMarkers = false;
        this.silentLoading = false;
      }
    },

    /**
     * Refresh all marker layers by clearing and re-adding markers
     */
    refreshMarkerLayers() {
      this.clearAllMarkerLayers();
      this.addMarkersToLayers();
    },

    /**
     * Clear all markers from their layers
     */
    clearAllMarkerLayers() {
      Object.values(this.markerLayers).forEach(layer => {
        if (layer) {
          layer.clearLayers();
        }
      });
    },

    /**
     * Add markers to their respective layer groups
     */
    addMarkersToLayers() {
      // Process each marker type
      Object.entries(this.markerData).forEach(([typeId, markers]) => {
        // Create layer group if it doesn't exist
        if (!this.markerLayers[typeId]) {
          this.markerLayers[typeId] = L.layerGroup();
        }

        // Add markers to the layer group
        markers.forEach(markerData => {
          const markerType = this.markerTypes.find(type => type.id === typeId);
          if (!markerType) return;

          // Create marker with popup
          const marker = L.marker([markerData.lat, markerData.lng], {
            icon: markerType.icon
          }).bindPopup(`
            <div class="marker-popup">
              <h3><strong>${markerData.name || ''}</strong></h3>
              ${markerData.address ? `<p><strong>Adresse:</strong> ${markerData.address}</p>` : ''}
              ${markerData.opening_hours ? `<p><strong>Åpningstider:</strong> ${markerData.opening_hours}</p>` : ''}
              ${markerData.contact_info ? `<p><strong>Kontakt:</strong> ${markerData.contact_info}</p>` : ''}
              ${markerData.description ? `<p><strong>Beskrivelse:</strong> ${markerData.description}</p>` : ''}
            </div>
          `);

          this.markerLayers[typeId].addLayer(marker);
        });

        // Add layer to map if it should be visible
        const markerType = this.markerTypes.find(type => type.id === typeId);
        if (markerType && markerType.visible && this.map) {
          this.markerLayers[typeId].addTo(this.map);
        }
      });
    },

    /**
     * Set the active base layer for the map
     * @param {string} layerId - ID of the layer to activate
     */
    setActiveLayer(layerId) {
      if (!this.map) return;

      const layer = MapService.setActiveLayer(this.map, layerId);

      if (layer) {
        this.activeLayerId = layerId;
      }
    },

    /**
     * Initialize markers and their layer groups
     */
    async initMarkers() {
      this.isLoadingMarkers = true;
      this.markersLoadError = null;

      try {
        // Clean up existing markers
        this.removeAllMarkerLayers();

        // Reset marker state
        this.markerLayers = {};
        this.markerData = {};

        // First, fetch marker types since they have the icon definitions
        this.markerTypes = await MarkerService.fetchMarkerTypes();

        // Create empty layer groups for each marker type
        this.markerTypes.forEach(markerType => {
          this.markerLayers[markerType.id] = L.layerGroup();
        });

        // Fetch marker data based on current map view
        const bounds = MapService.getMapBounds(this.map);
        this.markerData = await MarkerService.fetchAllMarkers(bounds);

        // Add markers to their layer groups
        this.addMarkersToLayers();

        // Mark that initial markers have been loaded
        this.initialMarkersLoaded = true;

        // Set up map event listeners for future updates
        this.setupMapEventListeners();

      } catch (error) {
        console.error('Error initializing markers:', error);
        this.markersLoadError = 'Failed to load markers. Please try again later.';

        // Initialize empty objects to prevent UI errors
        this.markerTypes = [];
        this.markerLayers = {};
        this.markerData = {};
      } finally {
        this.isLoadingMarkers = false;
      }
    },

    /**
     * Remove all marker layers from the map (but keep layer groups)
     */
    removeAllMarkerLayers() {
      if (!this.map) return;

      Object.values(this.markerLayers).forEach(layer => {
        if (layer) {
          layer.removeFrom(this.map);
        }
      });
    },

    /**
     * Set visibility for all marker types
     * @param {boolean} isVisible - Whether markers should be visible
     */
    setAllMarkersVisibility(isVisible) {
      if (!this.map) return;

      // Update visibility state for all marker types
      this.markerTypes.forEach(markerType => {
        markerType.visible = isVisible;

        const layer = this.markerLayers[markerType.id];
        if (!layer) return;

        // Add or remove layer from map
        if (isVisible) {
          layer.addTo(this.map);
        } else {
          layer.removeFrom(this.map);
        }
      });
    },

    /**
     * Toggle visibility for a specific marker type
     * @param {string} markerId - ID of the marker type to toggle
     */
    toggleMarkerVisibility(markerId) {
      if (!this.map) return;

      // Find marker type
      const markerType = this.markerTypes.find(type => type.id === markerId);
      if (!markerType) return;

      // Toggle visibility state
      markerType.visible = !markerType.visible;

      const layer = this.markerLayers[markerId];
      if (!layer) return;

      // Add or remove from map
      if (markerType.visible) {
        layer.addTo(this.map);
      } else {
        layer.removeFrom(this.map);
      }
    },

    /**
     * Resize the map when container dimensions change
     */
    resizeMap() {
      MapService.invalidateMapSize(this.map);
    },

    /**
     * Clean up resources when component is unmounted
     */
    cleanupMap() {
      // Clean up event listeners
      if (this.mapMoveCleanup) {
        this.mapMoveCleanup();
        this.mapMoveCleanup = null;
      }

      // Clean up marker layers
      this.removeAllMarkerLayers();

      // Clean up the map
      if (this.map) {
        MapService.cleanupMap(this.map);
        this.map = null;
      }

      // Reset state
      this.markerLayers = {};
      this.markerData = {};
      this.markerTypes = [];
      this.initialMarkersLoaded = false;
    }
  }
});
