// stores/map/mapStore.js
import { defineStore } from 'pinia';
import MapService from '@/service/map/mapService';
import LayerService from '@/service/map/layerService';
import MarkerService from '@/service/map/markerService';
import L from 'leaflet';

export const useMapStore = defineStore('map', {
  state: () => ({
    map: null,
    activeLayerId: 'standard',
    mapLayers: {},
    layerOptions: [],
    markerTypes: [],
    markerLayers: {},
    markerData: {},
    isLoadingMarkers: false,
    markersLoadError: null
  }),

  actions: {
    initMap(container) {
      this.map = MapService.createMap(container);
      this.layerOptions = LayerService.getLayerOptions();
      this.mapLayers = LayerService.getLayerDefinitions();
      this.setActiveLayer(this.activeLayerId);

      // Initialize markers
      this.initMarkers();

      // Force a resize after initialization
      setTimeout(() => {
        MapService.invalidateMapSize(this.map);
      }, 300);

      return this.map;
    },

    setActiveLayer(layerId) {
      // Remove all current layers
      Object.values(this.mapLayers).forEach(layers => {
        if (this.map.hasLayer(layers.base)) {
          this.map.removeLayer(layers.base);
        }
      });

      // Add the selected layer
      if (this.mapLayers[layerId]) {
        this.map.addLayer(this.mapLayers[layerId].base);
        this.activeLayerId = layerId;
      }
    },

    async initMarkers() {
      this.isLoadingMarkers = true;
      this.markersLoadError = null;

      try {
        // Clear any existing markers
        if (this.markerLayers) {
          Object.values(this.markerLayers).forEach(layer => {
            if (this.map && layer) {
              layer.removeFrom(this.map);
            }
          });
        }

        // Initialize empty objects
        this.markerLayers = {};
        this.markerData = {};

        // Fetch marker data from API first
        this.markerData = await MarkerService.fetchAllMarkers();

        // Then fetch marker types - this now depends on the markers from the API
        this.markerTypes = await MarkerService.fetchMarkerTypes();

        // Initialize empty layer groups for each marker type
        this.markerTypes.forEach(markerType => {
          this.markerLayers[markerType.id] = L.layerGroup();
        });

        // Add markers to layer groups
        Object.entries(this.markerData).forEach(([typeId, markers]) => {
          markers.forEach(markerData => {
            const markerType = this.markerTypes.find(type => type.id === typeId);
            if (!markerType) return;

            const marker = L.marker([markerData.lat, markerData.lng], {
              icon: markerType.icon
            }).bindPopup(`
              <div>
                <h3>${markerData.name}</h3>
                <p>${markerData.description || ''}</p>
              </div>
            `);

            this.markerLayers[typeId].addLayer(marker);
          });

          // Add layer to map if it should be visible initially
          const markerType = this.markerTypes.find(type => type.id === typeId);
          if (markerType && markerType.visible) {
            this.markerLayers[typeId].addTo(this.map);
          }
        });
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

    setAllMarkersVisibility(isVisible) {
      // Update visibility state for all marker types
      this.markerTypes.forEach(markerType => {
        markerType.visible = isVisible;

        // Add or remove from map
        if (isVisible) {
          this.markerLayers[markerType.id]?.addTo(this.map);
        } else {
          this.markerLayers[markerType.id]?.removeFrom(this.map);
        }
      });
    },

    toggleMarkerVisibility(markerId) {
      // Find marker type
      const markerType = this.markerTypes.find(type => type.id === markerId);
      if (!markerType) return;

      // Toggle visibility state
      markerType.visible = !markerType.visible;

      // Add or remove from map
      if (markerType.visible) {
        this.markerLayers[markerId]?.addTo(this.map);
      } else {
        this.markerLayers[markerId]?.removeFrom(this.map);
      }
    },

    resizeMap() {
      MapService.invalidateMapSize(this.map);
    },

    cleanupMap() {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }
    }
  }
});
