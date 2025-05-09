// stores/map/mapStore.js
import { defineStore } from 'pinia';
import MapService from '@/service/map/mapService';
import MarkerService from '@/service/map/markerService';
import MarkerConfigService from '@/service/map/markerConfigService';
import MarkerAdminService from '@/service/admin/markerAdminService';
import IncidentMapService from '@/service/map/incidentMapService';
import IncidentConfigService from '@/service/map/incidentConfigService';
import RoutingService from '@/service/map/routingService';
import GeolocationService from '@/service/map/geoLocationService.js';
import GeocodingService from '@/service/map/geocodingService.js'
import L from 'leaflet';

export const useMapStore = defineStore('map', {
  state: () => ({
    // Core map state
    map: null,
    initialLat: 63.43,
    initialLng: 10.39,
    initialZoom: 13,

    // Marker state
    markerTypes: [],
    markerLayers: {},
    markerData: {},
    cachedMarkerTypes: null,
    editingMarkerId: null,

    // Notifications
    notification: null,
    notificationTimeout: null,

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
    isLoading: false, // General loading state (migrated from markerAdminStore)

    // Cleanup reference
    mapMoveCleanup: null,

    // Map Routing
    activeRoute: null,
    routeStart: null,
    routeEnd: null,
    isGeneratingRoute: false,
    routeError: null,

    // Search state
    searchResults: [],
    isSearching: false,
    searchError: null,
    selectedSearchResult: null,
    searchResultMarker: null,

    // Admin marker state (migrated from markerAdminStore)
    markers: [],
    filteredMarkers: [],
    markersLayer: null,
    searchTerm: '',
    filterType: '',
    error: null,
    success: null,
    markerFormData: {
      id: null,
      type: 'HEARTSTARTER',
      name: '',
      address: '',
      postalCode: '',
      city: '',
      description: '',
      contactInfo: '',
      openingHours: '',
      latitude: 63.4305,
      longitude: 10.3951
    },
    isEditing: false,
    isCreating: false
  }),

  getters: {
    visibleMarkerData() {
      const result = {};

      // For each marker type
      Object.entries(this.markerData).forEach(([typeId, markers]) => {
        // Filter out the marker being edited
        result[typeId] = markers.filter(marker =>
          !this.editingMarkerId || marker.id !== this.editingMarkerId
        );
      });

      return result;
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
    },

    // Migrated from markerAdminStore
    /**
     * Get marker types for the dropdown
     */
    adminMarkerTypes() {
      const configs = MarkerConfigService.getMarkerConfigs();
      return Object.entries(configs).map(([id, config]) => ({
        id,
        name: config.norwegianName
      }));
    },

    /**
     * Check if we have markers
     */
    hasMarkers() {
      return this.markers.length > 0;
    }
  },

  actions: {
    /**
     * Set a marker as being edited
     * @param {string} markerId - ID of the marker being edited
     */
    setEditingMarkerId(markerId) {
      this.editingMarkerId = markerId;
      this.clearAllMarkerLayers();
      this.addMarkersToLayers();
    },


    /**
     * Initialize the map and setup initial state
     * @param {HTMLElement} container - DOM element to contain the map
     * @returns {L.Map} The created map instance
     */
    async initMap(container) {
      if (!container) return null;

      try {

        // Create the map with initial values from state
        this.map = MapService.createMap(container, {
          center: [this.initialLat, this.initialLng],
          zoom: this.initialZoom,
        });

        // Add zoom control in the bottom right corner
        L.control.zoom({
          position: 'bottomright'
        }).addTo(this.map);

        // Make route function available globally for popup click handlers
        window.createRouteToMarker = (markerData) => {
          this.createRouteToMarker(markerData);
        };

        // Initialize markers
        await this.initMarkers();

        // Initialize incidents
        await this.initIncidents();

        setTimeout(() => {
          MapService.invalidateMapSize(this.map);
          this.refreshMarkerLayers();
        }, 300);

        // Try to get user location and center map there
        try {
          const userCoords = await GeolocationService.getUserLocation();
          if (userCoords && userCoords.length === 2) {
            this.map.setView([userCoords[0], userCoords[1]], this.initialZoom);
          }
        } catch (locationError) {
          console.warn("Could not get user location for initial map centering:", locationError);
          // Continue with default coordinates
        }

        return this.map;
      } catch (error) {
        console.error("Error initializing map:", error);
        return null;
      }
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
        // Fetch marker data directly into state
        this.markerData = await this.fetchMarkerDataForCurrentView();

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
      if (!this.map) return;

      // Clear all markers from their layers
      this.clearAllMarkerLayers();

      // Re-add markers to layers
      this.addMarkersToLayers();
    },



    /**
     * Create a marker with popup for the map
     * @param {Object} markerData - Data for the marker
     * @param {Object} markerType - Type configuration for the marker
     * @returns {L.Marker|null} - The created Leaflet marker or null
     */
    createMarkerWithPopup(markerData, markerType) {
      if (!markerData || !markerType) return null;

      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: markerType.icon
      });

      const popupContent = MarkerConfigService.createMarkerPopupContent(markerData);
      marker.bindPopup(popupContent);

      return marker;
    },

    /**
     * Create a route from user's location to a selected map marker
     * @param {Object} markerData - The marker to route to
     */
    async createRouteToMarker(markerData) {
      if (!markerData || !markerData.lat || !markerData.lng) {
        console.error("Invalid marker data for routing:", markerData);
        this.routeError = "Ugyldig markørdata for ruteberegning.";
        return;
      }

      try {
        this.showNotification("Genererer rute...");

        let startCoords;

        try {
          const pos = await GeolocationService.getBrowserLocation({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          });
          startCoords = [pos.coords.latitude, pos.coords.longitude];
          // cache this for any future calls
          GeolocationService._lastKnownPosition = startCoords;
        } catch (err) {
          console.warn("Browser geolocation failed, falling back to cache/IP:", err);

          // —— 2) Fallback to cached-or-IP location ——
          try {
            startCoords = await GeolocationService.getCachedLocation();
          } catch (cacheErr) {
            console.error("No cached location available:", cacheErr);
          }

          if (!startCoords) {
            this.routeError = "Kunne ikke hente din posisjon.";
            this.showNotification("Kunne ikke hente din posisjon.");
            return;
          }
        }

        const endCoords = [markerData.lat, markerData.lng];

        await this.generateRoute(startCoords, endCoords);

        this.showNotification(`Rute til ${markerData.name || 'markør'} generert`);
      } catch (error) {
        console.error("Error creating route to marker:", error);
        this.routeError = "Kunne ikke generere rute. " + (error.message || "");
        this.showNotification("Kunne ikke generere rute.");
      }
    },

    /**
     * Get user's current position as a promise
     * @returns {Promise<Array>} User position as [lat, lng]
     */
    async getUserPosition() {
      try {
        return await GeolocationService.getUserLocation();
      } catch (error) {
        console.error("Error getting user position:", error);
        this.routeError = "Kunne ikke hente din posisjon: " + GeolocationService.getErrorMessage(
          error);
        return null;
      }
    },

    /**
     * Show a temporary notification message
     * @param {string} message - Message to display
     */
    showNotification(message) {
      this.notification = message;

      // Clear previous timeout if exists
      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout);
      }

      // Auto-dismiss after 3 seconds
      this.notificationTimeout = setTimeout(() => {
        this.notification = null;
      }, 3000);
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
     * Handle errors during marker initialization
     * @param {Error} error - The error that occurred
     */
    handleMarkerInitError(error) {
      console.error('Error initializing markers:', error);
      this.markersLoadError = 'Failed to load markers. Please try again later.';

      // Initialize empty objects to prevent UI errors
      this.markerTypes = this.markerTypes || [];
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

      // Force map update to ensure visibility changes take effect immediately
      this.resizeMap();
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

      // Force map update to ensure visibility changes take effect immediately
      this.resizeMap();
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
      // First clean up any active routes
      this.clearRoute();

      this.removeAllMarkerLayers();

      if (this.incidentLayer && this.map) {
        this.incidentLayer.clearLayers();
        this.incidentLayer.removeFrom(this.map);
        this.incidentLayer = null;
      }

      if (this.map) {
        this.map.off();
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
      if (!this.map || !startCoords || !endCoords) {
        console.error("Cannot generate route: missing map or coordinates", {
          map: !!this.map,
          startCoords,
          endCoords
        });
        this.routeError = "Kan ikke generere rute: mangler kart eller koordinater";
        return;
      }

      this.isGeneratingRoute = true;
      this.routeError = null;

      try {
        console.log("Generating route from", startCoords, "to", endCoords);

        // Store the coordinates
        this.routeStart = startCoords;
        this.routeEnd = endCoords;

        // Make sure RoutingService is imported
        const RoutingService = await import('@/service/map/routingService').then(m => m.default);

        // Show the route
        this.activeRoute = RoutingService.showRoute(this.map, startCoords, endCoords);

        // Center map to fit the route
        const bounds = L.latLngBounds([
          L.latLng(startCoords[0], startCoords[1]),
          L.latLng(endCoords[0], endCoords[1])
        ]).pad(0.3); // Add 30% padding around the route

        this.map.fitBounds(bounds);

        console.log("Route generated successfully");
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
      this.routeStart = this.routeEnd = null;
    },

    /**
     * Search for places and addresses
     * @param {string} query - The search query
     * @returns {Promise<Array>} Search results
     */
    async searchPlaces(query) {
      if (!query || query.trim() === '') {
        this.searchResults = [];
        this.searchError = null;
        this.isSearching = false;
        return [];
      }

      this.isSearching = true;
      this.searchError = null;

      try {
        const results = await GeocodingService.searchPlaces(query);
        this.searchResults = results;
        return results;
      } catch (error) {
        console.error('Error searching places:', error);
        this.searchError = 'Failed to search places. Please try again later.';
        this.searchResults = [];
        return [];
      } finally {
        this.isSearching = false;
      }
    },

    /**
     * Go to a location on the map
     * @param {Object} location - Location with lat and lng
     * @param {number} zoomLevel - Zoom level to set (optional)
     */
    goToLocation(location, zoomLevel = null) {
      if (!this.map || !location || !location.lat || !location.lng) return;

      // Center map on the location
      this.map.setView([location.lat, location.lng], zoomLevel);

      // Clear any existing search result marker
      this.clearSearchResultMarker();

      // Create a marker for the search result
      this.createSearchResultMarker(location);

      // Show notification
      this.showNotification(`Gikk til ${location.name || 'valgt plassering'}`);
    },

    /**
     * Create a marker for a search result
     * @param {Object} location - Location to mark
     */
    createSearchResultMarker(location) {
      if (!this.map || !location) return;

      // Create a custom icon for search results
      const searchIcon = L.divIcon({
        className: 'custom-div-icon search-result-icon',
        html: `<div style="background-color: #3498db; width: 20px; height: 20px; border-radius: 50%;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      // Create the marker
      this.searchResultMarker = L.marker([location.lat, location.lng], {
        icon: searchIcon,
        zIndexOffset: 1000 // Ensure it appears above other markers
      }).addTo(this.map);

      // Store the selected search result
      this.selectedSearchResult = location;
    },

    /**
     * Clear the search result marker from the map
     */
    clearSearchResultMarker() {
      if (this.searchResultMarker && this.map) {
        this.searchResultMarker.removeFrom(this.map);
        this.searchResultMarker = null;
      }
      this.selectedSearchResult = null;
    },

    /**
     * Handle a search result selection
     * @param {Object} result - The selected search result
     */
    selectSearchResult(result) {
      if (!result) return;

      this.goToLocation(result, 16); // Zoom level 16 gives good detail for most locations
      this.searchResults = []; // Clear results after selection
    },

    /* -----------------------------------------------------------------
     * ADMIN MARKER MANAGEMENT METHODS (MIGRATED FROM markerAdminStore)
     * ----------------------------------------------------------------- */

    /**
     * Set the markers layer reference
     * @param {Object} layer - Leaflet layer group for markers
     */
    setMarkersLayer(layer) {
      this.markersLayer = layer;
    },

    /**
     * Clear all markers from the map
     */
    clearMarkers() {
      if (this.markersLayer) {
        this.markersLayer.clearLayers();
      }
    },

    /**
     * Add a marker to the map
     * @param {Object} map - Leaflet map instance
     * @param {Object} markerData - Marker data
     * @returns {Object} - Leaflet marker
     */
    addMarkerToMap(map, markerData) {
      // Get the marker configuration
      const configs = MarkerConfigService.getMarkerConfigs();
      const config = configs[markerData.type];

      if (!config) return null;

      // Create marker icon
      const icon = MarkerConfigService.createLeafletIcon(
        config.iconType,
        config.color
      );

      // Create marker
      const marker = L.marker(
        [markerData.latitude, markerData.longitude],
        { icon }
      );

      // Add to map
      if (this.markersLayer) {
        this.markersLayer.addLayer(marker);
      } else {
        marker.addTo(map);
      }

      return marker;
    },

    /**
     * Refresh markers on the map
     * @param {Object} map - Leaflet map instance
     */
    refreshMapMarkers(map) {
      this.clearMarkers();

      // Add all markers to the map
      this.markers.forEach(markerData => {
        this.addMarkerToMap(map, markerData);
      });
    },

    /**
     * Fetch all markers for admin interface
     */
    async fetchMarkers() {
      this.isLoading = true;
      this.error = null;

      try {
        const markers = await MarkerAdminService.fetchAllMarkersForAdmin();
        this.markers = markers.map(marker => ({
          id: marker.id,
          type: marker.type,
          name: marker.name || '',
          address: marker.address || '',
          postalCode: marker.postalCode || '',
          city: marker.city || '',
          description: marker.description || '',
          contactInfo: marker.contactInfo || '',
          openingHours: marker.openingHours || '',
          latitude: marker.latitude,
          longitude: marker.longitude
        }));
        this.applyFilters();

        // If we're currently editing a marker, make sure we handle the editing state
        if (this.isEditing && this.markerFormData.id) {
          this.setEditingMarkerId(this.markerFormData.id);
        }
      } catch (error) {
        this.error = 'Kunne ikke laste markører. Vennligst prøv igjen senere.';
        console.error('Error in fetchMarkers:', error);
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Apply search and filters to markers
     */
    applyFilters() {
      // Apply both search and type filter
      this.filteredMarkers = this.markers.filter(marker => {
        const matchesSearch =
          this.searchTerm === '' ||
          (marker.name && marker.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.address && marker.address.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.postalCode && marker.postalCode.toString().includes(this.searchTerm)) ||
          (marker.city && marker.city.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.description && marker.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.contactInfo && marker.contactInfo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.openingHours && marker.openingHours.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.type && marker.type.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.latitude && marker.latitude.toString().includes(this.searchTerm)) ||
          (marker.longitude && marker.longitude.toString().includes(this.searchTerm));

        const matchesType =
          this.filterType === '' ||
          marker.type === this.filterType;

        return matchesSearch && matchesType;
      });
    },

    /**
     * Set search term and apply filters
     */
    setSearchTerm(term) {
      this.searchTerm = term;
      this.applyFilters();
    },

    /**
     * Set filter type and apply filters
     */
    setFilterType(type) {
      this.filterType = type;
      this.applyFilters();
    },

    /**
     * Reset form data for creating a new marker
     */
    initNewMarker() {
      this.isCreating = true;
      this.isEditing = false;
      this.error = null;
      this.success = null;

      this.markerFormData = {
        id: null,
        type: 'HEARTSTARTER',
        name: '',
        address: '',
        postalCode: '',
        city: '',
        description: '',
        contactInfo: '',
        openingHours: '',
        latitude: 63.4305,
        longitude: 10.3951
      };
    },

    /**
     * Load marker data into form for editing
     */
    editMarker(marker) {
      this.setEditingMarkerId(marker.id);

      const [street, postal, city] = (marker.address || '').split(',').map(p => p.trim());

      this.markerFormData = {
        id: marker.id,
        type: marker.type,
        name: marker.name || '',
        address: street || '',
        postalCode: postal || '',
        city: city || '',
        description: marker.description || '',
        contactInfo: marker.contactInfo || '',
        openingHours: marker.openingHours || '',
        latitude: marker.latitude,
        longitude: marker.longitude
      };

      this.isEditing = true;
      this.isCreating = false;
      this.error = null;
      this.success = null;
    },

    /**
     * Create a new marker
     */
    async createMarker() {
      this.isLoading = true;
      this.error = null;

      try {
        const {
          id,
          address,
          postalCode,
          city,
          ...rest
        } = this.markerFormData;

        const requestData = {
          ...rest,
          address: `${address}, ${postalCode}, ${city}`
        };

        // Call API to create the marker
        await MarkerAdminService.createMarker(requestData);

        // Assuming the API returns a success message rather than the created object
        this.success = 'Markør opprettet.';

        // Refresh the marker list
        await this.fetchMarkers();

        // Reset form state
        this.isCreating = false;

        return true;
      } catch (error) {
        // Handle different types of errors
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error;
        } else {
          this.error = 'Kunne ikke opprette markør. Vennligst prøv igjen senere.';
        }
        console.error('Error in createMarker:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Update an existing marker
     */
    async updateMarker() {
      this.isLoading = true;
      this.error = null;

      try {
        const {
          id,
          address,
          postalCode,
          city,
          ...rest
        } = this.markerFormData;

        const requestData = {
          ...rest,
          address: `${address}, ${postalCode}, ${city}`
        };

        await MarkerAdminService.updateMarker(id, requestData);

        // Assuming the API returns a success message
        this.success = 'Markør oppdatert.';

        // Refresh the marker list
        await this.fetchMarkers();

        // Reset form state
        this.isEditing = false;

        return true;
      } catch (error) {
        // Handle different types of errors
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error;
        } else {
          this.error = 'Kunne ikke oppdatere markør. Vennligst prøv igjen senere.';
        }
        console.error('Error in updateMarker:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Save marker (create or update)
     */
    async saveMarker() {
      let success = false;

      if (this.isCreating) {
        success = await this.createMarker();
      } else if (this.isEditing) {
        success = await this.updateMarker();
      }

      // Only reset the editingMarkerId if the save was successful
      if (success) {
        this.clearEditingMarkerId();
        this.clearAllMarkerLayers();

        // Re-add markers to layers
        this.addMarkersToLayers();
        await this.fetchAndDisplayMarkers()
      }

      return success;
    },

    /**
     * Delete a marker
     */
    async deleteMarker(id) {
      this.isLoading = true;
      this.error = null;

      try {
        await MarkerAdminService.deleteMarker(id);
        this.success = 'Markør slettet.';

        // Remove from local arrays
        this.markers = this.markers.filter(marker => marker.id !== id);
        this.applyFilters();

        // Clear the editing marker
        this.clearEditingMarkerId();


        await this.fetchMarkers();

        await this.fetchAndDisplayMarkers();

        // Reset form state if we were editing this marker
        if (this.isEditing && this.markerFormData.id === id) {
          this.isEditing = false;
        }

        return true;
      } catch (error) {
        // Handle different types of errors
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error;
        } else {
          this.error = 'Kunne ikke slette markør. Vennligst prøv igjen senere.';
        }
        console.error('Error in deleteMarker:', error);
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Update marker address based on coordinates using reverse geocoding
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<Object>} Address information
     */
    async updateAddressFromCoordinates(lat, lng) {
      try {
        const addressInfo = await GeocodingService.reverseGeocode(lat, lng);

        if (addressInfo && addressInfo.address) {
          // Extract address components from the response
          const { address } = addressInfo;

          // Parse the address components
          // The structure may vary depending on the country and location type
          const streetAddress = address.road || address.footway || address.pedestrian || '';
          const houseNumber = address.house_number || '';
          const formattedStreet = houseNumber ? `${streetAddress} ${houseNumber}` : streetAddress;

          // Update the form data with the new address information
          this.markerFormData.address = formattedStreet;
          this.markerFormData.postalCode = address.postcode || '';
          this.markerFormData.city = address.city || address.town || address.village || address.suburb || '';

          return {
            address: formattedStreet,
            postalCode: address.postcode || '',
            city: this.markerFormData.city
          };
        }

        return null;
      } catch (error) {
        console.error('Error in updateAddressFromCoordinates:', error);
        // Don't throw the error to prevent UI disruption
        return null;
      }
    },

    /**
     * Update marker coordinates
     */
    updateMarkerCoordinates(lat, lng) {
      this.markerFormData.latitude = lat;
      this.markerFormData.longitude = lng;

      // If we're in edit mode, update the current marker's position
      if (this.isEditing) {
        const marker = this.markers.find(m => m.id === this.markerFormData.id);
        if (marker) {
          marker.latitude = this.markerFormData.latitude;
          marker.longitude = this.markerFormData.longitude;
        }
      }
    },

    /**
     * Update coordinates based on address using geocoding
     * @param {string} addressQuery - The address string to geocode
     * @returns {Promise<Object|null>} - Coordinates or null if not found
     */
    async updateCoordinatesFromAddress(addressQuery) {
      try {
        // Search for places with the address query
        const results = await GeocodingService.searchPlaces(addressQuery, {
          limit: 1, // Only get the top result
          countryCode: 'no' // Limit to Norway
        });

        if (results && results.length > 0) {
          const result = results[0];
          const lat = result.lat;
          const lng = result.lng;

          // Update store values
          this.markerFormData.latitude = lat;
          this.markerFormData.longitude = lng;

          // If we're in edit mode, update the marker in the list
          if (this.isEditing) {
            const marker = this.markers.find(m => m.id === this.markerFormData.id);
            if (marker) {
              marker.latitude = lat;
              marker.longitude = lng;
            }
          }

          return { lat, lng };
        }

        return null;
      } catch (error) {
        console.error('Error in updateCoordinatesFromAddress:', error);
        return null;
      }
    },

    /**
     * Cancel editing/creating
     */
    async cancelEdit() {
      this.isEditing = false;
      this.isCreating = false;
      this.error = null;
      this.success = null;

      // Important: Clear any temporary state that might be preserving the moved position
      this.editingMarkerId = null;

      await this.fetchAndDisplayMarkers(true); // Pass true to force a fresh fetch
      await this.fetchMarkers();
    },

    /**
     * Clear the editing marker ID
     */
    async clearEditingMarkerId() {

      const maxRetries = 3;
      let retryCount = 0;
      let success = false;

      while (!success && retryCount < maxRetries) {
        try {

          // Set editingMarkerId to null first
          const previousId = this.editingMarkerId;
          this.editingMarkerId = null;

          this.clearAllMarkerLayers();

          await new Promise(resolve => setTimeout(resolve, 50 * (retryCount + 1)));

          await this.fetchAndDisplayMarkers();

          // Verify editingMarkerId is still null (race condition check)
          if (this.editingMarkerId !== null) {
            console.warn('Race condition detected: editingMarkerId was changed during operation');
            throw new Error('Race condition: editingMarkerId changed during operation');
          }

          // Force map to update
          if (this.map) {
            setTimeout(() => {
              if (this.map) this.map.invalidateSize();
            }, 50);
          }
          await this.fetchAndDisplayMarkers();

          success = true;
        } catch (error) {
          console.warn(`Attempt ${retryCount + 1} failed:`, error);
          retryCount++;

          // Add increasing delay between retries
          if (retryCount < maxRetries) {
            const delay = 200 * retryCount;
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!success) {
        console.error('Failed to clear editing marker after', maxRetries, 'attempts');
        // Final attempt with different approach as fallback
        try {
          this.editingMarkerId = null;

          // Force refresh all marker data directly
          if (this.map) {
            const bounds = MapService.getMapBounds(this.map);
            this.markerData = await MarkerService.fetchAllMarkers(bounds);

            Object.values(this.markerLayers).forEach(layer => {
              if (layer && this.map) {
                layer.removeFrom(this.map);
              }
            });

            // Reset marker layers
            this.markerLayers = {};

            // Reinitialize layers
            this.markerLayers = MarkerConfigService.createMarkerLayerGroups(this.markerTypes);

            // Add markers to their layer groups
            this.addMarkersToLayers();

          } else {
            console.warn('No map reference for fallback approach');
          }
        } catch (fallbackError) {
          console.error('Fallback approach also failed:', fallbackError);
        }
      }

      return success;
    },

    /**
     * Clear all markers from their layers
     */ async clearAllMarkerLayers() {
      try {

        for (const [key, layer] of Object.entries(this.markerLayers)) {
          if (layer) {
            layer.clearLayers();
          } else {
            console.warn(`Layer ${key} is null or undefined`);
          }
        }

      } catch (error) {
        console.error('Error in clearAllMarkerLayers:', error);
      } finally {
        console.groupEnd();
      }

      await this.fetchAndDisplayMarkers()
    },

    /**
     * Fetch marker data and display on map
     */
    async fetchAndDisplayMarkers() {

      try {
        const bounds = this.map ? MapService.getMapBounds(this.map) : null;
        this.markerData = await MarkerService.fetchAllMarkers(bounds);

        await this.addMarkersToLayers();

        return true;
      } catch (error) {
        console.error('Error in fetchAndDisplayMarkers:', error);
        return false;
      } finally {
        console.groupEnd();
      }
    },


    /**
     * Add markers to layers
     */ async addMarkersToLayers() {

      try {
        // Use the visibleMarkerData getter to filter out being-edited markers
        const visibleData = this.visibleMarkerData;

        // Process each marker type
        for (const [typeId, markers] of Object.entries(visibleData)) {

          // Create layer group if it doesn't exist
          if (!this.markerLayers[typeId]) {
            this.markerLayers[typeId] = L.layerGroup();
          }

          // Get marker type configuration
          let markerType;

          // Special handling for admin markers
          if (typeId === 'ADMIN') {
            // Clear the admin layer first
            this.markerLayers[typeId].clearLayers();

            // Add admin markers with their specific icons
            markers.forEach(markerData => {
              try {
                // Get the proper config for this marker's type
                const configs = MarkerConfigService.getMarkerConfigs();
                const config = configs[markerData.type];
                if (!config) {
                  console.warn(`No config found for admin marker type: ${markerData.type}`);
                  return;
                }

                // Create the marker with the specific icon
                const icon = MarkerConfigService.createLeafletIcon(
                  config.iconType,
                  config.color
                );

                const marker = L.marker(
                  [markerData.lat, markerData.lng],
                  { icon }
                );

                // Create popup content
                const popupContent = MarkerConfigService.createMarkerPopupContent(markerData);
                marker.bindPopup(popupContent);

                // Add to the ADMIN layer
                this.markerLayers[typeId].addLayer(marker);
              } catch (error) {
                console.error(`Error processing admin marker:`, error, markerData);
              }
            });
          } else {
            markerType = this.markerTypes.find(type => type.id === typeId);
            if (!markerType) {
              console.warn(`No marker type found for type id: ${typeId}`);
              continue
            }

            this.markerLayers[typeId].clearLayers();

            // Add each marker to layer
            markers.forEach(markerData => {
              try {
                const marker = this.createMarkerWithPopup(markerData, markerType);
                this.markerLayers[typeId].addLayer(marker);
              } catch (error) {
                console.error(`Error adding marker to layer:`, error, markerData);
              }
            });

          }
          if ((typeId === 'ADMIN' || (markerType && markerType.visible)) && this.map) {
            this.markerLayers[typeId].addTo(this.map);
          } else {
          }
        }
      } catch (error) {
        console.error('Error in addMarkersToLayers:', error);
      } finally {
        console.groupEnd();
      }
    },

    /**
     * Clear success message
     */
    clearSuccess() {
      this.success = null;
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null;
    },

    /**
     * Set admin markers to be displayed on the map
     * @param {Array} adminMarkers - Array of admin marker objects
     */
    setAdminMarkers(adminMarkers) {
      // Create a special layer type for admin markers if it doesn't exist
      if (!this.markerData['ADMIN']) {
        this.markerData['ADMIN'] = [];
      }

      // Update the admin markers
      this.markerData['ADMIN'] = adminMarkers.filter(marker =>
        !marker.editingMarkerId || marker.id !== marker.editingMarkerId
      );

      // Make sure we have a layer for admin markers
      if (!this.markerLayers['ADMIN']) {
        this.markerLayers['ADMIN'] = L.layerGroup();

        // Add a special marker type for admin markers if it doesn't exist
        this.markerTypes.some(type => type.id === 'ADMIN');

      }

      this.refreshMarkerLayers();
    },
  }
});
