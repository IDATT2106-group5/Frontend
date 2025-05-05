// stores/map/mapStore.js
import { defineStore } from 'pinia';
import MapService from '@/service/map/mapService';
import MarkerService from '@/service/map/markerService';
import IncidentMapService from '@/service/map/incidentMapService';
import RoutingService from '@/service/map/routingService';

import L from 'leaflet';
import {
  Heart,
  UtensilsCrossed,
  Home,
  Building,
  Users
} from 'lucide-vue-next';

// Map Lucide icons to their SVG paths
const getSVGPath = (iconType) => {
  switch (iconType) {
    case 'Heart':
      return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>';
    case 'Stethoscope':
      return '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path><circle cx="20" cy="10" r="2"></circle>';
    case 'UtensilsCrossed':
      return '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path><path d="m2.1 21.8 6.4-6.3"></path><path d="m19 5-7 7"></path>';
    case 'Home':
      return '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';
    case 'Building':
      return '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>';
    case 'Users':
      return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>';
    default:
      return '';
  }
};

// Function to create Leaflet icon for markers
const createLeafletIcon = (iconType, color) => {
  // Create a custom divIcon for Leaflet
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon">${getSVGPath(iconType)}</svg>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Map of icon configurations for each marker type
const markerConfig = {
  'HEARTSTARTER': {
    iconType: 'Heart',
    lucideIcon: Heart,
    color: '#d81b60',
    norwegianName: 'Hjertestarter'
  },
  'FOODSTATION': {
    iconType: 'UtensilsCrossed',
    lucideIcon: UtensilsCrossed,
    color: '#7b1fa2',
    norwegianName: 'Matstasjon'
  },
  'SHELTER': {
    iconType: 'Home',
    lucideIcon: Home,
    color: '#1976d2',
    norwegianName: 'Tilfluktsrom'
  },
  'HOSPITAL': {
    iconType: 'Building',
    lucideIcon: Building,
    color: '#388e3c',
    norwegianName: 'Sykehus'
  },
  'MEETINGPLACE': {
    iconType: 'Users',
    lucideIcon: Users,
    color: '#f57c00',
    norwegianName: 'Møteplass'
  }
};

// Define incident severity visualization configuration
const severityConfig = {
  RED: {
    id: 'RED',
    name: 'Kritisk farenivå',
    color: '#FF3D33', // Red
    fillOpacity: 0.35,
    strokeWidth: 2,
    // Visual configuration for concentric circles
    visual: {
      // Each severity can have multiple circles with different radiusMultipliers
      circles: [
        { color: '#45D278', radiusMultiplier: 1.2, fillOpacity: 0.25, strokeWidth: 1 },  // Green (outermost)
        { color: '#FFC700', radiusMultiplier: 1.1, fillOpacity: 0.3, strokeWidth: 1.5 }, // Yellow (middle)
        { color: '#FF3D33', radiusMultiplier: 1.0, fillOpacity: 0.35, strokeWidth: 2 }   // Red (innermost)
      ]
    }
  },
  YELLOW: {
    id: 'YELLOW',
    name: 'Forhøyet farenivå',
    color: '#FFC700', // Yellow
    fillOpacity: 0.3,
    strokeWidth: 1.5,
    // Visual configuration for concentric circles
    visual: {
      circles: [
        { color: '#45D278', radiusMultiplier: 1.1, fillOpacity: 0.25, strokeWidth: 1 },  // Green (outermost)
        { color: '#FFC700', radiusMultiplier: 1.0, fillOpacity: 0.3, strokeWidth: 1.5 }  // Yellow (innermost)
      ]
    }
  },
  GREEN: {
    id: 'GREEN',
    name: 'Lavt farenivå',
    color: '#45D278', // Green
    fillOpacity: 0.25,
    strokeWidth: 1,
    // Visual configuration for concentric circles
    visual: {
      circles: [
        { color: '#45D278', radiusMultiplier: 1.0, fillOpacity: 0.25, strokeWidth: 1 }  // Green (only circle)
      ]
    }
  }
};

/**
 * Helper function to fetch and process marker types
 * @param {Function} formatTypeTitle - Function to format type titles
 * @param {Function} processMarkerTypes - Function to process marker types with icons
 * @param {Array|null} cachedTypes - Cached marker types if available
 * @param {Function} fetchMarkers - Function to fetch markers
 * @returns {Promise<Array>} Processed marker types
 */
async function fetchAndProcessMarkerTypes(formatTypeTitle, processMarkerTypes, cachedTypes, fetchMarkers) {
  // Use cached marker types if available
  if (cachedTypes) {
    return cachedTypes;
  }

  // Otherwise fetch and process marker types
  try {
    // Fetch all markers with null bounds to get available types
    const allMarkers = await fetchMarkers(null);

    // Extract unique types from markers
    const typeSet = new Set();
    Object.keys(allMarkers).forEach(typeId => {
      typeSet.add(typeId);
    });

    // Convert to array of marker type objects
    const types = Array.from(typeSet).map(typeId => ({
      id: typeId,
      title: formatTypeTitle(typeId),
      visible: true
    }));

    // Add icon information to marker types
    return processMarkerTypes(types);
  } catch (error) {
    console.error('Error fetching marker types:', error);
    return [];
  }
}

/**
 * Create layer groups for marker types
 * @param {Array} markerTypes - Array of marker types
 * @returns {Object} Object mapping type IDs to layer groups
 */
function createMarkerLayerGroups(markerTypes) {
  const markerLayers = {};
  markerTypes.forEach(markerType => {
    markerLayers[markerType.id] = L.layerGroup();
  });
  return markerLayers;
}

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
      return markerConfig;
    },

    /**
     * Get severity level definitions
     */
    severityLevels() {
      return severityConfig;
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
     * Format type ID into a readable title
     * @param {string} typeId - Marker type ID
     * @returns {string} Formatted title
     */
    formatTypeTitle(typeId) {
      // If markerConfig has a Norwegian name for this type, use it
      if (markerConfig[typeId]?.norwegianName) {
        return markerConfig[typeId].norwegianName;
      }

      // For all-caps IDs, convert to Title Case as fallback
      if (typeId === typeId.toUpperCase()) {
        return typeId.charAt(0).toUpperCase() +
          typeId.slice(1).toLowerCase().replace(/([A-Z])/g, ' $1').trim();
      }

      // For Norwegian terms, just capitalize first letter
      return typeId.charAt(0).toUpperCase() + typeId.slice(1);
    },

    /**
     * Process marker types with icon information
     * @param {Array} types - Basic marker type information
     * @returns {Array} Processed marker types with icons
     */
    processMarkerTypes(types) {
      // First filter out types that don't have icon configurations
      const validTypes = types.filter(type => {
        if (!markerConfig[type.id]) {
          console.warn(`Unknown marker type: ${type.id} - this marker type will be excluded.`);
          return false;
        }
        return true;
      });

      // Then map the valid types to include their icon information
      return validTypes.map(type => ({
        ...type,
        icon: createLeafletIcon(
          markerConfig[type.id].iconType,
          markerConfig[type.id].color
        ),
        lucideIcon: markerConfig[type.id].lucideIcon,
        color: markerConfig[type.id].color
      }));
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
      return L.marker([markerData.lat, markerData.lng], {
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
      // Use the helper function to fetch and process marker types
      const types = await fetchAndProcessMarkerTypes(
        this.formatTypeTitle,
        this.processMarkerTypes,
        this.cachedMarkerTypes,
        MarkerService.fetchAllMarkers
      );

      // Cache the processed marker types for future use
      this.cachedMarkerTypes = types;

      // Set marker types in state
      this.markerTypes = types;

      // Create layer groups for each marker type
      this.markerLayers = createMarkerLayerGroups(this.markerTypes);
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
     * Create a popup for an incident
     * @param {Object} incident - Incident data
     * @param {Object} config - Severity configuration
     * @returns {string} HTML content for the popup
     */
    createIncidentPopupContent(incident, config) {
      return `
        <div class="incident-popup">
          ${incident.name ? `<h3>${incident.name}</h3>` : ''}
          ${incident.description ? `<p>${incident.description}</p>` : ''}
          ${incident.startedAt ? `<p><strong>Startet:</strong> ${new Date(incident.startedAt).toLocaleString()}</p>` : ''}
          ${incident.severity ? `<p><strong>Farenivå:</strong> ${config.name}</p>` : ''}
        </div>
      `;
    },

    /**
     * Create a circle for an incident visualization
     * @param {Object} incident - Incident data
     * @param {Object} circleConfig - Circle configuration
     * @param {number} baseRadius - Base radius in meters
     * @param {L.Marker} centerMarker - Center marker for the popup
     * @returns {L.Circle} Configured circle
     */
    createIncidentCircle(incident, circleConfig, baseRadius, centerMarker) {
      const circle = L.circle([incident.latitude, incident.longitude], {
        radius: baseRadius * circleConfig.radiusMultiplier,
        color: circleConfig.color,
        fillColor: circleConfig.color,
        fillOpacity: circleConfig.fillOpacity,
        weight: circleConfig.strokeWidth,
        interactive: true
      });

      // Add click handler to open the popup on the center marker
      circle.on('click', () => {
        centerMarker.openPopup();
      });

      return circle;
    },

    /**
     * Create concentric circles for an incident based on severity
     * @param {Object} incident - Incident data
     * @returns {L.LayerGroup} - Layer group containing the circles
     */
    createIncidentCircles(incident) {
      if (!this.map) return null;

      const severity = incident.severity || 'GREEN';
      const baseRadius = incident.impactRadius * 1000; // Convert km to meters
      const config = this.severityLevels[severity] || this.severityLevels.GREEN;

      // Create a layer group to hold our circles
      const layerGroup = L.layerGroup();

      // Create a marker at the center for the popup
      const popupContent = this.createIncidentPopupContent(incident, config);

      // Create a central marker that will hold the popup
      const centerMarker = L.marker([incident.latitude, incident.longitude], {
        opacity: 0,  // Make the marker invisible
        interactive: true // But keep it interactive
      }).bindPopup(popupContent);

      layerGroup.addLayer(centerMarker);

      // If visual configuration exists, create circles according to it
      if (config.visual && config.visual.circles) {
        // Sort circles by radius multiplier in descending order
        // to ensure proper z-index stacking (largest circles at the bottom)
        const sortedCircles = [...config.visual.circles]
          .sort((a, b) => b.radiusMultiplier - a.radiusMultiplier);

        // Create each circle according to the configuration
        sortedCircles.forEach(circleConfig => {
          const circle = this.createIncidentCircle(
            incident,
            circleConfig,
            baseRadius,
            centerMarker
          );

          layerGroup.addLayer(circle);
        });
      }

      return layerGroup;
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
        // Use the store's method to create circles
        const circleGroup = this.createIncidentCircles(incident);
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
