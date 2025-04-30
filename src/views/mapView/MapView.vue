<template>
  <div class="map-container">
    <div id="map" ref="mapContainer"></div>

    <!-- Custom Layer Controls -->
    <div class="layer-control-container">
      <div class="layer-controls">
        <button
          v-for="layer in layerOptions"
          :key="layer.id"
          :class="['layer-button', { active: activeLayerId === layer.id }]"
          @click="setActiveLayer(layer.id)"
        >
          <div class="layer-icon" :class="[`${layer.id}-icon`]"></div>
          <div class="layer-name">{{ layer.name }}</div>
        </button>
      </div>
    </div>
    <!-- Marker Filter -->
    <div class="marker-filter-container">
      <MarkerFilter />
    </div>
  </div>
</template>

<script>
import { onMounted, ref, onUnmounted } from 'vue'
import { useMapStore } from '@/stores/map/mapStore'
import { storeToRefs } from 'pinia'
import MarkerFilter from '@/components/map/MarkerFilter.vue'
import 'leaflet/dist/leaflet.css'

export default {
  name: 'EmergencyMap',
  components: { MarkerFilter },
  setup() {
    const mapContainer = ref(null)
    const mapStore = useMapStore()

    // Use storeToRefs for reactive properties
    const { layerOptions, activeLayerId } = storeToRefs(mapStore)

    onMounted(() => {
      mapStore.initMap(mapContainer.value)

      // Add resize event listener
      window.addEventListener('resize', handleResize)
    })

    onUnmounted(() => {
      // Clean up event listener
      window.removeEventListener('resize', handleResize)

      // Clean up map
      mapStore.cleanupMap()
    })

    const handleResize = () => {
      mapStore.resizeMap()
    }

    const setActiveLayer = (layerId) => {
      mapStore.setActiveLayer(layerId)
    }

    return {
      mapContainer,
      layerOptions,
      activeLayerId,
      setActiveLayer,
    }
  },
}
</script>

<style scoped>
.map-container {
  width: 100%;
  height: calc(100vh - 60px);
  position: relative;
  overflow: hidden;
}

#map {
  width: 100%;
  height: 100%;
}

/* Layer Control Container*/
.layer-control-container {
  position: absolute;
  bottom: 30px;
  left: 30px;
  z-index: 1000;
}

/* Layer Controls */
.layer-controls {
  display: flex;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 4px;
}

.layer-button {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  border-radius: 8px;
  padding: 8px 10px;
  margin: 0 2px;
  cursor: pointer;
  transition: background-color 0.2s;
  min-width: 65px;
}

.layer-button:hover {
  background-color: #f5f5f5;
}

.layer-button.active {
  background-color: #f0f0f0;
}

.layer-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 4px;
  transition: all 0.2s;
}

.satellite-icon {
  background-color: #212121;
}

.terrain-icon {
  background-color: #e8f5e9;
}

.standard-icon {
  background-color: #fafafa;
  border: 1px solid #e0e0e0;
}

.layer-name {
  font-size: 11px;
  color: #333;
  font-weight: 500;
}

/* Custom Zoom Controls */
:deep(.leaflet-control-zoom) {
  margin-bottom: 30px !important;
  margin-right: 30px !important;
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
}

:deep(.leaflet-control-zoom-in:hover),
:deep(.leaflet-control-zoom-out:hover) {
  background-color: #f0f0f0;
}

/* Hide attribution control */
:deep(.leaflet-control-attribution) {
  display: none;
}

.marker-filter-container {
  position: absolute;
  top: 30px;
  left: 30px;
  z-index: 1000;
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
</style>
