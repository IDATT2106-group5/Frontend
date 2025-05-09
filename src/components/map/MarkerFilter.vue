<script>
/**
 * MarkerFilter Component
 *
 * This component provides a UI for filtering map markers. It allows users to show or hide all markers
 * or toggle the visibility of individual marker types. The component is designed to work with the
 * map store and uses Pinia for state management.
 */

import { useMapStore } from '@/stores/map/mapStore'
import { storeToRefs } from 'pinia'
import Button from '@/components/ui/button/Button.vue'

export default {
  name: 'MarkerFilter',
  components: {
    Button,
  },
  props: {
    /**
     * Indicates whether the component is being viewed on a mobile device.
     * @type {Boolean}
     * @default false
     */
    isMobileView: {
      type: Boolean,
      default: false,
    },
  },
  /**
   * The setup function is the entry point for the component's logic.
   * It initializes the map store and provides methods to toggle marker visibility.
   *
   * @returns {{markerTypes: *, toggleMarker: toggleMarker, showAllMarkers: showAllMarkers, hideAllMarkers: hideAllMarkers}}
   */
  setup() {
    const mapStore = useMapStore()
    const { markerTypes } = storeToRefs(mapStore)

    /**
     * Toggles the visibility of a specific marker type.
     * @param {String} markerId - The ID of the marker to toggle.
     */
    const toggleMarker = (markerId) => {
      mapStore.toggleMarkerVisibility(markerId)
    }

    /**
     * Sets all markers to be visible.
     */
    const showAllMarkers = () => {
      mapStore.setAllMarkersVisibility(true)
    }

    /**
     * Hides all markers.
     */
    const hideAllMarkers = () => {
      mapStore.setAllMarkersVisibility(false)
    }

    return {
      markerTypes,
      toggleMarker,
      showAllMarkers,
      hideAllMarkers,
    }
  },
}
</script>

<template>
  <div
    class="bg-white rounded-xl p-4 w-60 max-w-full md:w-60 w-full md:rounded-xl rounded-lg md:p-4 p-3"
  >
    <!-- Header Section -->
    <div class="border-b border-gray-200 mb-3 pb-2">
      <h3 class="md:text-base text-sm m-0 font-medium">Filtrer</h3>
    </div>

    <!-- Marker List -->
    <div v-if="markerTypes.length > 0">
      <!-- Buttons to show or hide all markers -->
      <div class="flex mb-4 gap-2">
        <Button
          variant="outline"
          size="sm"
          class="flex-1 hover:bg-gray-200"
          @click="showAllMarkers"
        >
          Vis alle
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="flex-1 hover:bg-gray-200"
          @click="hideAllMarkers"
        >
          Skjul alle
        </Button>
      </div>

      <!-- List of individual marker types -->
      <div class="flex flex-col md:gap-3 gap-2 md:max-h-[300px] max-h-[200px] overflow-y-auto">
        <div
          v-for="marker in markerTypes"
          :key="marker.id"
          class="rounded-lg transition-colors hover:bg-gray-100"
        >
          <label class="relative flex items-center cursor-pointer md:p-1.5 p-1 w-full">
            <!-- Checkbox to toggle marker visibility -->
            <input
              type="checkbox"
              :checked="marker.visible"
              @change="toggleMarker(marker.id)"
              class="sr-only"
            />
            <span
              class="relative inline-block md:w-[18px] md:h-[18px] w-4 h-4 border border-gray-300 rounded mr-2 bg-white"
              :class="{ 'border-blue-500': marker.visible }"
            >
              <span
                v-if="marker.visible"
                class="absolute md:left-1 left-0.5 md:top-0.5 top-0.5 md:w-2 w-1.5 md:h-3 h-2.5 border-r-2 border-b-2 border-blue-500 transform rotate-45"
              ></span>
            </span>

            <!-- Marker icon and title -->
            <div class="flex items-center ml-2">
              <div
                class="md:w-7 w-6 md:h-7 h-6 md:mr-2.5 mr-2 flex items-center justify-center"
                :style="{ color: marker.color }"
              >
                <component
                  :is="marker.lucideIcon"
                  :size="isMobileView ? 16 : 20"
                  :color="marker.color"
                />
              </div>
              <div class="md:text-sm text-xs">{{ marker.title }}</div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Message when no marker types are available -->
    <div v-else class="py-3 text-center text-gray-500 md:text-sm text-xs">
      Ingen markørtyper tilgjengelig
    </div>
  </div>
</template>
