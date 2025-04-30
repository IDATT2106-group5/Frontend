<template>
  <div class="filter-container">
    <div class="filter-header">
      <h3>Filtrer</h3>
    </div>

    <div class="filter-actions">
      <Button
        variant="outline"
        size="sm"
        class="show-all-btn"
        @click="showAllMarkers"
      >
        Vis alle
      </Button>
      <Button
        variant="outline"
        size="sm"
        class="hide-all-btn"
        @click="hideAllMarkers"
      >
        Skjul alle
      </Button>
    </div>

    <div class="filter-options">
      <div
        v-for="marker in markerTypes"
        :key="marker.id"
        class="filter-option"
      >
        <label class="checkbox-container">
          <input
            type="checkbox"
            :checked="marker.visible"
            @change="toggleMarker(marker.id)"
          />
          <span class="checkmark"></span>

          <div class="marker-details">
            <div class="marker-icon" :style="{ color: marker.color }">
              <component :is="marker.lucideIcon" size="20" :color="marker.color" />
            </div>
            <div class="marker-name">{{ marker.name }}</div>
          </div>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { useMapStore } from '@/stores/map/mapStore';
import { storeToRefs } from 'pinia';
import Button from '@/components/ui/button/Button.vue';

export default {
  name: 'MarkerFilter',
  components: {
    Button
  },
  setup() {
    const mapStore = useMapStore();
    const { markerTypes } = storeToRefs(mapStore);

    const toggleMarker = (markerId) => {
      mapStore.toggleMarkerVisibility(markerId);
    };

    const showAllMarkers = () => {
      mapStore.setAllMarkersVisibility(true);
    };

    const hideAllMarkers = () => {
      mapStore.setAllMarkersVisibility(false);
    };

    return {
      markerTypes,
      toggleMarker,
      showAllMarkers,
      hideAllMarkers
    };
  }
};
</script>

<style scoped>
.filter-container {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
  padding: 16px;
  width: 240px;
}

.filter-header {
  border-bottom: 1px solid #eee;
  margin-bottom: 12px;
  padding-bottom: 8px;
}

.filter-header h3 {
  font-size: 16px;
  margin: 0;
  font-weight: 500;
}

.filter-actions {
  display: flex;
  margin-bottom: 16px;
  gap: 8px;
}

.show-all-btn, .hide-all-btn {
  flex: 1;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-option {
  border-radius: 8px;
  transition: background-color 0.2s;
}

.filter-option:hover {
  background-color: #f5f5f5;
}

/* Checkbox styles */
.checkbox-container {
  position: relative;
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 6px;
  width: 100%;
}

.checkbox-container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

.checkmark {
  position: absolute;
  left: 6px;
  height: 18px;
  width: 18px;
  background-color: #eee;
  border-radius: 3px;
}

.checkbox-container:hover input ~ .checkmark {
  background-color: #ccc;
}

.checkbox-container input:checked ~ .checkmark {
  background-color: #2196F3;
}

.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

.checkbox-container .checkmark:after {
  left: 6px;
  top: 3px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

.marker-details {
  display: flex;
  align-items: center;
  margin-left: 28px;
}

.marker-icon {
  width: 28px;
  height: 28px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.marker-name {
  font-size: 14px;
}
</style>
