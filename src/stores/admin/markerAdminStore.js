// src/stores/admin/markerAdminStore.js
import { defineStore } from 'pinia';
import MarkerAdminService from '@/service/admin/markerAdminService';
import MarkerConfigService from '@/service/map/markerConfigService';
import GeocodingService from '@/service/map/geocodingService.js'
import { useMapStore } from '@/stores/map/mapStore';

export const useMarkerAdminStore = defineStore('markerAdmin', {
  state: () => ({
    markers: [],
    filteredMarkers: [],
    markersLayer: null, // Add a reference to store the markers layer
    searchTerm: '',
    filterType: '',
    isLoading: false,
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
    /**
     * Get marker types for the dropdown
     */
    markerTypes() {
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

        // If we're currently editing a marker, make sure mapStore knows about it
        if (this.isEditing && this.markerFormData.id) {
          const mapStore = useMapStore();
          mapStore.setEditingMarkerId(this.markerFormData.id);
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
          (marker.openingHours && marker.openingHours.toLowerCase().includes(this.searchTerm.toLowerCase()));
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
      const mapStore = useMapStore();

      // Set which marker is being edited in mapStore
      mapStore.setEditingMarkerId(marker.id);

      // Regular marker editing logic
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
        await MarkerAdminService.createMarker(requestData)

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
      const mapStore = useMapStore();
      let success = false;

      if (this.isCreating) {
        success = await this.createMarker();
      } else if (this.isEditing) {
        success = await this.updateMarker();
      }

      // Only reset the editingMarkerId in mapStore if the save was successful
      if (success) {
        mapStore.clearEditingMarkerId();
      }

      return success;
    },

    /**
     * Delete a marker
     */
    async deleteMarker(id) {
      const mapStore = useMapStore();
      this.isLoading = true;
      this.error = null;

      try {
        await MarkerAdminService.deleteMarker(id);
        this.success = 'Markør slettet.';

        // Remove from local arrays
        this.markers = this.markers.filter(marker => marker.id !== id);
        this.applyFilters();

        // Clear the editing marker in mapStore
        mapStore.clearEditingMarkerId();

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
    cancelEdit() {
      const mapStore = useMapStore();

      // Clear the editing marker state in mapStore
      mapStore.clearEditingMarkerId();

      // Regular cancel edit logic
      this.isEditing = false;
      this.isCreating = false;
      this.error = null;
      this.success = null;
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
    }
  }
});