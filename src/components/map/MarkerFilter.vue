<script>
import { useMapStore } from '@/stores/map/mapStore';
import { storeToRefs } from 'pinia';
import Button from '@/components/ui/button/Button.vue';

export default {
  name: 'MarkerFilter',
  components: {
    Button
  },
  props: {
    isMobileView: {
      type: Boolean,
      default: false
    }
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

<template>
  <div class="bg-white rounded-xl p-4 w-60 max-w-full md:w-60 w-full md:rounded-xl rounded-lg md:p-4 p-3">
    <div class="border-b border-gray-200 mb-3 pb-2">
      <h3 class="md:text-base text-sm m-0 font-medium">Filtrer</h3>
    </div>

    <div v-if="markerTypes.length > 0">
      <div class="flex mb-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          class="flex-1"
          @click="showAllMarkers"
        >
          Vis alle
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="flex-1"
          @click="hideAllMarkers"
        >
          Skjul alle
        </Button>
      </div>

      <div class="flex flex-col md:gap-3 gap-2 md:max-h-[300px] max-h-[200px] overflow-y-auto">
        <div
          v-for="marker in markerTypes"
          :key="marker.id"
          class="rounded-lg transition-colors hover:bg-gray-100"
        >
          <label class="relative flex items-center cursor-pointer md:p-1.5 p-1 w-full">
            <input
              type="checkbox"
              :checked="marker.visible"
              @change="toggleMarker(marker.id)"
              class="sr-only"
            />
            <span class="relative inline-block md:w-[18px] md:h-[18px] w-4 h-4 border border-gray-300 rounded mr-2 bg-white" :class="{ 'border-blue-500': marker.visible }">
              <span v-if="marker.visible" class="absolute md:left-1 left-0.5 md:top-0.5 top-0.5 md:w-2 w-1.5 md:h-3 h-2.5 border-r-2 border-b-2 border-blue-500 transform rotate-45"></span>
            </span>

            <div class="flex items-center ml-2">
              <div class="md:w-7 w-6 md:h-7 h-6 md:mr-2.5 mr-2 flex items-center justify-center" :style="{ color: marker.color }">
                <component :is="marker.lucideIcon" :size="isMobileView ? 16 : 20" :color="marker.color" />
              </div>
              <div class="md:text-sm text-xs">{{ marker.title }}</div>
            </div>
          </label>
        </div>
      </div>
    </div>
    <div v-else class="py-3 text-center text-gray-500 md:text-sm text-xs">
      Ingen markørtyper tilgjengelig
    </div>
  </div>
</template>
