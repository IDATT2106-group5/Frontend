// stores/map/mapStore.js
import { defineStore } from 'pinia';
import MapService from '@/service/map/mapService';
import MarkerService from '@/service/map/markerService';
import MarkerConfigService from '@/service/map/markerConfigService';
import IncidentMapService from '@/service/map/incidentMapService';
import IncidentConfigService from '@/service/map/incidentConfigService';
import RoutingService from '@/service/map/routingService';

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
    cachedMarkerTypes: null,

    // Incident state
    incidents: [],
    incidentLayer: null,
    isLoadingIncidents: false,
    incidentsLoadError: null,

    // UI state
    isLoadingMarkers: false,
    markersLoadError: null,
    initialMarkersLoaded: false,
    silentLoading: false,

    // Cleanup reference
    mapMoveCleanup: null,

    // Map Routing
    activeRoute: null,
    routeStart: null,
    routeEnd: null,
    isGeneratingRoute: false,
    routeError: null
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
    },

    /**
     * Check if there are any incidents
     */
    hasIncidents() {
      return this.incidents.length > 0;
    },

    /**
     * Group incidents by severity
     */
    incidentsBySeverity() {
      const result = {
        RED: [],
        YELLOW: [],
        GREEN: []
      };

      this.incidents.forEach(incident => {
        if (result[incident.severity]) {
          result[incident.severity].push(incident);
        } else {
          result.GREEN.push(incident);
        }
      });

      return result;
    },

    /**
     * Get marker type configurations
     */
    markerConfigs() {
      return MarkerConfigService.getMarkerConfigs();
    },

    /**
     * Get severity level definitions
     */
    severityLevels() {
      return IncidentConfigService.getSeverityLevels();
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

      // Initialize incidents
      this.initIncidents();

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
     * Set loading state for marker updates
     * @param {boolean} silent - Whether to use silent loading
     */
    setMarkerLoadingState(silent = false) {
      if (silent) {
        this.silentLoading = true;
      } else {
        this.isLoadingMarkers = true;
      }
      this.markersLoadError = null;
    },

    /**
     * Reset loading state for marker updates
     */
    resetMarkerLoadingState() {
      this.isLoadingMarkers = false;
      this.silentLoading = false;
    },

    /**
     * Fetch marker data based on current map bounds
     * @returns {Promise<Object>} Marker data by type
     */
    async fetchMarkerDataForCurrentView() {
      if (!this.map) return {};

      const bounds = MapService.getMapBounds(this.map);
      return await MarkerService.fetchAllMarkers(bounds);
    },

    /**
     * Update markers based on current map view
     * @param {boolean} silent - Whether to show loading indicator
     */
    async updateMarkersForCurrentView(silent = false) {
      if (!this.map) return;

      // Set loading state
      this.setMarkerLoadingState(silent);

      try {
        // Fetch marker data
        const newMarkerData = await this.fetchMarkerDataForCurrentView();

        // Update marker data
        this.markerData = newMarkerData;

        // Refresh marker layers
        this.refreshMarkerLayers();
      } catch (error) {
        console.error('Error updating markers for current view:', error);
        this.markersLoadError = 'Failed to update markers. Please try again later.';
      } finally {
        // Reset loading state
        this.resetMarkerLoadingState();
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
     * Create marker with popup for display on map
     * @param {Object} markerData - Data for the marker
     * @param {Object} markerType - Type configuration for the marker
     * @returns {L.Marker} Leaflet marker with popup
     */
    createMarkerWithPopup(markerData, markerType) {
      const popupContent = MarkerConfigService.createMarkerPopupContent(markerData);

      return L.marker([markerData.lat, markerData.lng], {
        icon: markerType.icon
      }).bindPopup(popupContent);
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

        // Find marker type configuration
        const markerType = this.markerTypes.find(type => type.id === typeId);
        if (!markerType) return;

        // Add markers to the layer group
        markers.forEach(markerData => {
          const marker = this.createMarkerWithPopup(markerData, markerType);
          this.markerLayers[typeId].addLayer(marker);
        });

        // Add layer to map if it should be visible
        if (markerType.visible && this.map) {
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
        await this.resetMarkerState();
        await this.fetchAndInitializeMarkerTypes();
        await this.fetchAndDisplayMarkers();

        // Mark that initial markers have been loaded
        this.initialMarkersLoaded = true;

        // Set up map event listeners for future updates
        this.setupMapEventListeners();
      } catch (error) {
        this.handleMarkerInitError(error);
      } finally {
        this.isLoadingMarkers = false;
      }
    },

    /**
     * Reset marker state to prepare for initialization
     */
    async resetMarkerState() {
      // Clean up existing markers
      this.removeAllMarkerLayers();

      // Reset marker state
      this.markerLayers = {};
      this.markerData = {};
    },

    /**
     * Fetch and initialize marker types
     */
    async fetchAndInitializeMarkerTypes() {
      // Use MarkerService to fetch and process marker types
      const types = await MarkerService.fetchAndProcessMarkerTypes(this.cachedMarkerTypes);

      // Cache the processed marker types for future use
      this.cachedMarkerTypes = types;

      // Set marker types in state
      this.markerTypes = types;

      // Create layer groups for each marker type
      this.markerLayers = MarkerConfigService.createMarkerLayerGroups(this.markerTypes);
    },

    /**
     * Fetch marker data and display on map
     */
    async fetchAndDisplayMarkers() {
      // Fetch marker data based on current map view
      const bounds = MapService.getMapBounds(this.map);
      this.markerData = await MarkerService.fetchAllMarkers(bounds);

      // Add markers to their layer groups
      this.addMarkersToLayers();
    },

    /**
     * Handle errors during marker initialization
     * @param {Error} error - The error that occurred
     */
    handleMarkerInitError(error) {
      console.error('Error initializing markers:', error);
      this.markersLoadError = 'Failed to load markers. Please try again later.';

      // Initialize empty objects to prevent UI errors
      this.markerTypes = [];
      this.markerLayers = {};
      this.markerData = {};
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
     * Initialize incidents and incident layer
     */
    initIncidents() {
      if (!this.map) return;

      // Create incident layer and add to map
      this.incidentLayer = L.layerGroup().addTo(this.map);

      // Load incidents
      this.loadIncidents();
    },

    /**
     * Load incidents from API and add to map
     */
    async loadIncidents() {
      if (!this.map || !this.incidentLayer) return;

      this.isLoadingIncidents = true;
      this.incidentsLoadError = null;

      try {
        // Fetch incidents
        this.incidents = await IncidentMapService.fetchIncidents();

        // Add incidents to map
        this.updateIncidentsOnMap();
      } catch (error) {
        this.handleIncidentLoadError(error);
      } finally {
        this.isLoadingIncidents = false;
      }
    },

    /**
     * Handle errors during incident loading
     * @param {Error} error - The error that occurred
     */
    handleIncidentLoadError(error) {
      console.error('Error loading incidents:', error);
      this.incidentsLoadError = `Failed to load incidents: ${error.message}. Please check that the API is running and accessible.`;
      this.incidents = [];
    },

    /**
     * Update incidents on the map
     */
    updateIncidentsOnMap() {
      if (!this.map || !this.incidentLayer) return;

      // Clear existing incidents
      this.incidentLayer.clearLayers();

      // Add each incident to the map
      this.incidents.forEach(incident => {
        // Use the IncidentConfigService to create circles
        const circleGroup = IncidentConfigService.createIncidentCircles(incident, this.map);
        if (circleGroup) {
          this.incidentLayer.addLayer(circleGroup);
        }
      });
    },

    /**
     * Toggle visibility of the incident layer
     * @param {boolean} isVisible - Whether incidents should be visible
     */
    setIncidentsVisibility(isVisible) {
      if (!this.map || !this.incidentLayer) return;

      if (isVisible) {
        this.incidentLayer.addTo(this.map);
      } else {
        this.incidentLayer.removeFrom(this.map);
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
      this.clearRoute();
      this.cleanupEventListeners();
      this.cleanupMapLayers();
      this.resetState();
    },

    /**
     * Clean up event listeners
     */
    cleanupEventListeners() {
      if (this.mapMoveCleanup) {
        this.mapMoveCleanup();
        this.mapMoveCleanup = null;
      }
    },

    /**
     * Clean up map layers
     */
    cleanupMapLayers() {
      // Clean up marker layers
      this.removeAllMarkerLayers();

      // Clean up incident layer
      if (this.incidentLayer && this.map) {
        this.incidentLayer.clearLayers();
        this.incidentLayer.removeFrom(this.map);
        this.incidentLayer = null;
      }

      // Clean up the map
      if (this.map) {
        MapService.cleanupMap(this.map);
        this.map = null;
      }
    },

    /**
     * Reset state values
     */
    resetState() {
      // Reset state
      this.markerLayers = {};
      this.markerData = {};
      this.markerTypes = [];
      this.incidents = [];
      this.initialMarkersLoaded = false;
    },

    /**
     * Generate and display a route on the map
     *
     * @param {Array} startCoords - Starting coordinates [lat, lng]
     * @param {Array} endCoords - Destination coordinates [lat, lng]
     */
    async generateRoute(startCoords, endCoords) {
      if (!this.map || !startCoords || !endCoords) return;

      this.isGeneratingRoute = true;
      this.routeError = null;

      try {
        // Store the coordinates
        this.routeStart = startCoords;
        this.routeEnd = endCoords;

        // Show the route
        this.activeRoute = RoutingService.showRoute(this.map, startCoords, endCoords);

        // Add a popup to the destination marker if it exists
        const destinationType = this.findMarkerTypeByCoords(endCoords[0], endCoords[1]);
        if (destinationType) {
          const typeData = this.markerTypes.find(type => type.id === destinationType);
          L.popup()
          .setLatLng([endCoords[0], endCoords[1]])
          .setContent(`
            <div class="route-destination-popup">
              <h3>Destinasjon: ${typeData?.title || 'Ukjent'}</h3>
              <p>Følg den blå ruten</p>
            </div>
          `)
          .openOn(this.map);
        }
      } catch (error) {
        console.error("Error generating route:", error);
        this.routeError = "Kunne ikke generere rute. Vennligst prøv igjen senere.";
      } finally {
        this.isGeneratingRoute = false;
      }
    },

    /**
     * Clear the current route
     */
    clearRoute() {
      RoutingService.clearRoute();
      this.activeRoute = null;
      this.routeStart = null;
      this.routeEnd = null;
      this.routeError = null;
    },

    /**
     * Find marker type by coordinates
     */
    findMarkerTypeByCoords(lat, lng) {
      // Set a small threshold for coordinate comparison (to handle floating point precision)
      const threshold = 0.0001;

      // Check all marker types and their markers
      for (const [typeId, markers] of Object.entries(this.markerData)) {
        for (const marker of markers) {
          if (
            Math.abs(marker.lat - lat) < threshold &&
            Math.abs(marker.lng - lng) < threshold
          ) {
            return typeId;
          }
        }
      }
      return null;
    },
  }
});
