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
    markerData: {}
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

    initMarkers() {
      // Get marker types and data
      this.markerTypes = MarkerService.getMarkerTypes();
      this.markerData = MarkerService.getMarkerData();

      // Create layer groups for each marker type
      this.markerLayers = {};
      this.markerTypes.forEach(markerType => {
        this.markerLayers[markerType.id] = L.layerGroup();

        // Add markers to the layer group
        const markers = this.markerData[markerType.id] || [];
        markers.forEach(markerData => {
          const marker = L.marker([markerData.lat, markerData.lng], {
            icon: markerType.icon
          }).bindPopup(markerData.name);

          this.markerLayers[markerType.id].addLayer(marker);
        });

        // Add layer to map if it should be visible initially
        if (markerType.visible) {
          this.markerLayers[markerType.id].addTo(this.map);
        }
      });
    },

    setAllMarkersVisibility(isVisible) {
      // Update visibility state for all marker types
      this.markerTypes.forEach(markerType => {
        markerType.visible = isVisible;

        // Add or remove from map
        if (isVisible) {
          this.markerLayers[markerType.id].addTo(this.map);
        } else {
          this.markerLayers[markerType.id].removeFrom(this.map);
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
        this.markerLayers[markerId].addTo(this.map);
      } else {
        this.markerLayers[markerId].removeFrom(this.map);
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
