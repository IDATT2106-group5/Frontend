<template>
  <div class="base-map-container">
    <div id="map" ref="mapContainer"></div>
  </div>
</template>

<script>
import { onMounted, ref, onUnmounted, computed, defineProps, defineEmits } from 'vue';
import 'leaflet/dist/leaflet.css';
import MapService from '@/service/map/mapService';

export default {
  name: 'BaseMap',
  props: {
    center: {
      type: Array,
      default: () => [63.4305, 10.3951] // Default to Trondheim
    },
    zoom: {
      type: Number,
      default: 13
    },
    initialLayer: {
      type: String,
      default: 'standard'
    }
  },
  emits: ['map-ready', 'layer-changed'],
  setup(props, { emit }) {
    const mapContainer = ref(null);
    const map = ref(null);
    const activeLayerId = ref(props.initialLayer);

    // Get layer options from service
    const layerOptions = computed(() => {
      return MapService.getLayerOptions();
    });

    // Initialize map on component mount
    onMounted(() => {
      initMap();
    });

    // Clean up on unmount
    onUnmounted(() => {
      cleanupMap();
    });

    // Initialize the map
    const initMap = () => {
      if (!mapContainer.value) return;

      // Create the map using the MapService
      map.value = MapService.createMap(mapContainer.value, {
        center: props.center,
        zoom: props.zoom
      });

      // Set the initial active layer
      setActiveLayer(activeLayerId.value);

      // Force a resize after initialization to handle container sizing issues
      setTimeout(() => {
        MapService.invalidateMapSize(map.value);
      }, 300);

      // Emit map-ready event with the map instance
      emit('map-ready', map.value);
    };

    // Set the active base layer
    const setActiveLayer = (layerId) => {
      if (!map.value) return;

      const layer = MapService.setActiveLayer(map.value, layerId);

      if (layer) {
        activeLayerId.value = layerId;
        emit('layer-changed', layerId);
      }
    };

    // Resize the map when container dimensions change
    const resizeMap = () => {
      MapService.invalidateMapSize(map.value);
    };

    // Clean up resources when component is unmounted
    const cleanupMap = () => {
      if (map.value) {
        MapService.cleanupMap(map.value);
        map.value = null;
      }
    };

    // Expose methods that parent components might need
    return {
      mapContainer,
      map,
      activeLayerId,
      layerOptions,
      setActiveLayer,
      resizeMap,
      cleanupMap
    };
  }
};
</script>

<style scoped>
.base-map-container {
  width: 100%;
  height: 100%;
  position: relative;
}

#map {
  width: 100%;
  height: 100%;
}

/* Custom Zoom Controls */
:deep(.leaflet-control-zoom) {
  position: absolute !important;
  top: 16px !important;
  right: 16px !important;
  margin: 0 !important;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

:deep(.leaflet-control-zoom-in),
:deep(.leaflet-control-zoom-out) {
  width: 36px;
  height: 36px;
  line-height: 36px;
  background-color: white;
  color: #333;
  font-size: 18px;
  font-weight: bold;
  display: block;
}

:deep(.leaflet-control-zoom-in) {
  border-bottom: 1px solid #eee;
}

:deep(.leaflet-control-zoom-in:hover),
:deep(.leaflet-control-zoom-out:hover) {
  background-color: #f0f0f0;
}

:deep(.leaflet-control-attribution) {
  display: none;
}

:deep(.custom-div-icon) {
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
}

/* Mobile-specific styles */
@media (max-width: 767px) {
  :deep(.leaflet-control-zoom) {
    top: 16px !important;
  }

  :deep(.leaflet-control-zoom-in),
  :deep(.leaflet-control-zoom-out) {
    width: 30px;
    height: 30px;
    line-height: 30px;
    font-size: 16px;
  }
}
</style>
