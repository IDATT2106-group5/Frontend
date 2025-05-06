// src/stores/admin/markerAdminStore.js
import { defineStore } from 'pinia';
import MarkerAdminService from '@/service/admin/markerAdminService';
import MarkerConfigService from '@/service/map/markerConfigService';

export const useMarkerAdminStore = defineStore('markerAdmin', {
  state: () => ({
    markers: [],
    filteredMarkers: [],
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
      this.isCreating = true;
      this.isEditing = false;
      this.error = null;
      this.success = null;
    },

    /**
     * Load marker data into form for editing
     */
    editMarker(marker) {
      this.markerFormData = { ...marker };
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
        // Remove id from the request payload since it's a new marker
        const { id, ...requestData } = this.markerFormData;

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
        // Call API to update the marker
        await MarkerAdminService.updateMarker(
          this.markerFormData.id,
          this.markerFormData
        )

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
      if (this.isCreating) {
        return await this.createMarker();
      } else if (this.isEditing) {
        return await this.updateMarker();
      }
      return false;
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
     * Update marker coordinates
     */
    updateMarkerCoordinates(lat, lng) {
      this.markerFormData.latitude = lat;
      this.markerFormData.longitude = lng;
    },

    /**
     * Cancel editing/creating
     */
    cancelEdit() {
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
