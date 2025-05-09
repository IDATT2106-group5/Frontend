import { defineStore } from 'pinia'
import MapService from '@/service/map/mapService'
import MarkerService from '@/service/map/markerService'
import MarkerConfigService from '@/service/map/markerConfigService'
import MarkerAdminService from '@/service/admin/markerAdminService'
import IncidentMapService from '@/service/map/incidentMapService'
import IncidentConfigService from '@/service/map/incidentConfigService'
import RoutingService from '@/service/map/routingService'
import GeolocationService from '@/service/map/geoLocationService.js'
import GeocodingService from '@/service/map/geocodingService.js'
import L from 'leaflet'
import { useIncidentAdminStore } from '@/stores/admin/incidentAdminStore.js'
import { toast } from '@/components/ui/toast/index.js'

/**
 * Pinia store for map-related functionality.
 * Handles map initialization, markers, incidents, routing, and admin features.
 *
 * @function useMapStore
 * @returns {Object} The map store instance
 */
export const useMapStore = defineStore('map', {
  /**
   * The state of the map store.
   *
   * @returns {Object} The initial state object
   */
  state: () => ({
    map: null,
    initialLat: 63.43,
    initialLng: 10.39,
    initialZoom: 13,

    markerTypes: [],
    markerLayers: {},
    markerData: {},
    cachedMarkerTypes: null,
    editingMarkerId: null,

    notification: null,
    notificationTimeout: null,

    incidents: [],
    incidentLayer: null,
    isLoadingIncidents: false,
    incidentsLoadError: null,

    isLoadingMarkers: false,
    markersLoadError: null,
    initialMarkersLoaded: false,
    silentLoading: false,
    isLoading: false,

    mapMoveCleanup: null,

    activeRoute: null,
    routeStart: null,
    routeEnd: null,
    isGeneratingRoute: false,
    routeError: null,
    searchResults: [],
    isSearching: false,
    searchError: null,
    selectedSearchResult: null,
    searchResultMarker: null,
    markers: [],
    filteredMarkers: [],
    markersLayer: null,
    searchTerm: '',
    filterType: '',
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
      longitude: 10.3951,
    },
    /** @type {boolean} Whether a marker is currently being edited */
    isEditing: false,
    /** @type {boolean} Whether a new marker is being created */
    isCreating: false,
  }),

  /**
   * Computed properties (getters) for the map store.
   */
  getters: {
    /**
     * Get marker data excluding the marker being edited.
     *
     * @returns {Object.<string, MarkerData[]>} Filtered marker data by type
     */
    visibleMarkerData() {
      const result = {}

      Object.entries(this.markerData).forEach(([typeId, markers]) => {
        result[typeId] = markers.filter(
          (marker) => !this.editingMarkerId || marker.id !== this.editingMarkerId,
        )
      })

      return result
    },

    /**
     * Get only marker types that are currently visible.
     *
     * @returns {MarkerType[]} Array of visible marker types
     */
    visibleMarkerTypes() {
      return this.markerTypes.filter((type) => type.visible)
    },

    /**
     * Count total markers across all types.
     *
     * @returns {number} Total number of markers
     */
    totalMarkersCount() {
      let count = 0
      Object.values(this.markerData).forEach((markers) => {
        count += markers.length
      })
      return count
    },

    /**
     * Check if any markers are currently visible.
     *
     * @returns {boolean} True if any markers are visible
     */
    hasVisibleMarkers() {
      return this.markerTypes.some((type) => type.visible)
    },

    /**
     * Check if there are any incidents.
     *
     * @returns {boolean} True if there are incidents
     */
    hasIncidents() {
      return this.incidents.length > 0
    },

    /**
     * Group incidents by severity.
     *
     * @returns {Object.<string, Incident[]>} Incidents grouped by severity level
     */
    incidentsBySeverity() {
      const result = {
        RED: [],
        YELLOW: [],
        GREEN: [],
      }

      this.incidents.forEach((incident) => {
        if (result[incident.severity]) {
          result[incident.severity].push(incident)
        } else {
          result.GREEN.push(incident)
        }
      })

      return result
    },

    /**
     * Get marker type configurations.
     *
     * @returns {Object} Marker configurations
     */
    markerConfigs() {
      return MarkerConfigService.getMarkerConfigs()
    },

    /**
     * Get severity level definitions.
     *
     * @returns {Object} Severity level definitions
     */
    severityLevels() {
      return IncidentConfigService.getSeverityLevels()
    },

    /**
     * Get marker types for the admin dropdown.
     *
     * @returns {Array<{id: string, name: string}>} Array of marker types
     */
    adminMarkerTypes() {
      const configs = MarkerConfigService.getMarkerConfigs()
      return Object.entries(configs).map(([id, config]) => ({
        id,
        name: config.norwegianName,
      }))
    },

    /**
     * Check if we have markers.
     *
     * @returns {boolean} True if there are markers
     */
    hasMarkers() {
      return this.markers.length > 0
    },
  },

  /**
   * Actions for the map store.
   */
  actions: {
    /**
     * Set a marker as being edited.
     *
     * @param {string} markerId - ID of the marker being edited
     */
    setEditingMarkerId(markerId) {
      this.editingMarkerId = markerId
      this.clearAllMarkerLayers()
      this.addMarkersToLayers()
    },

    /**
     * Initialize the map and setup initial state.
     *
     * @param {HTMLElement} container - DOM element to contain the map
     * @returns {Promise<L.Map|null>} The created map instance or null if initialization failed
     */
    async initMap(container) {
      if (!container) return null

      try {
        this.map = MapService.createMap(container, {
          center: [this.initialLat, this.initialLng],
          zoom: this.initialZoom,
        })

        L.control
          .zoom({
            position: 'bottomright',
          })
          .addTo(this.map)

        window.createRouteToMarker = (markerData) => {
          this.createRouteToMarker(markerData)
        }

        await this.initMarkers()

        await this.initIncidents()

        setTimeout(() => {
          MapService.invalidateMapSize(this.map)
          this.refreshMarkerLayers()
        }, 300)

        try {
          const userCoords = await GeolocationService.getUserLocation()
          if (userCoords && userCoords.length === 2) {
            this.map.setView([userCoords[0], userCoords[1]], this.initialZoom)
          }
        } catch (locationError) {
          console.warn('Could not get user location for initial map centering:', locationError)
        }

        return this.map
      } catch (error) {
        console.error('Error initializing map:', error)
        return null
      }
    },

    /**
     * Set up map event listeners for updating markers when the map moves.
     */
    setupMapEventListeners() {
      if (!this.map) return

      if (this.mapMoveCleanup) {
        this.mapMoveCleanup()
        this.mapMoveCleanup = null
      }

      this.mapMoveCleanup = MapService.setupMapMoveListener(
        this.map,
        () => {
          if (this.initialMarkersLoaded) {
            this.updateMarkersForCurrentView(true)
          }
        },
        500,
      )
    },

    /**
     * Set loading state for marker updates.
     *
     * @param {boolean} silent - Whether to use silent loading
     */
    setMarkerLoadingState(silent = false) {
      if (silent) {
        this.silentLoading = true
      } else {
        this.isLoadingMarkers = true
      }
      this.markersLoadError = null
    },

    /**
     * Reset loading state for marker updates.
     */
    resetMarkerLoadingState() {
      this.isLoadingMarkers = false
      this.silentLoading = false
    },

    /**
     * Fetch marker data based on current map bounds.
     *
     * @returns {Promise<Object.<string, MarkerData[]>>} Marker data by type
     */
    async fetchMarkerDataForCurrentView() {
      if (!this.map) return {}

      const bounds = MapService.getMapBounds(this.map)
      return await MarkerService.fetchAllMarkers(bounds)
    },

    /**
     * Update markers based on current map view.
     *
     * @param {boolean} silent - Whether to show loading indicator
     */
    async updateMarkersForCurrentView(silent = false) {
      if (!this.map) return

      this.setMarkerLoadingState(silent)

      try {
        this.markerData = await this.fetchMarkerDataForCurrentView()

        this.refreshMarkerLayers()
      } catch (error) {
        console.error('Error updating markers for current view:', error)
        this.markersLoadError = 'Failed to update markers. Please try again later.'
      } finally {
        this.resetMarkerLoadingState()
      }
    },

    /**
     * Refresh all marker layers by clearing and re-adding markers.
     */
    refreshMarkerLayers() {
      if (!this.map) return

      this.clearAllMarkerLayers()

      this.addMarkersToLayers()
    },

    /**
     * Create a marker with popup for the map.
     *
     * @param {MarkerData} markerData - Data for the marker
     * @param {MarkerType} markerType - Type configuration for the marker
     * @returns {L.Marker|null} - The created Leaflet marker or null
     */
    createMarkerWithPopup(markerData, markerType) {
      if (!markerData || !markerType) return null

      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: markerType.icon,
      })

      const popupContent = MarkerConfigService.createMarkerPopupContent(
        markerData,
        localStorage.getItem('isSharing') === 'true',
      )
      marker.bindPopup(popupContent)

      return marker
    },

    /**
     * Create a route from user's location to a selected map marker.
     *
     * @param {MarkerData} markerData - The marker to route to
     */
    async createRouteToMarker(markerData) {
      if (!markerData || !markerData.lat || !markerData.lng) {
        console.error('Invalid marker data for routing:', markerData)
        this.routeError = 'Ugyldig markørdata for ruteberegning.'
        return
      }

      try {
        this.showNotification('Genererer rute...')

        let startCoords

        try {
          const pos = await GeolocationService.getBrowserLocation({
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0,
          })
          startCoords = [pos.coords.latitude, pos.coords.longitude]
          GeolocationService._lastKnownPosition = startCoords
        } catch (err) {
          console.warn('Browser geolocation failed, falling back to cache/IP:', err)

          try {
            startCoords = await GeolocationService.getCachedLocation()
          } catch (cacheErr) {
            console.error('No cached location available:', cacheErr)
          }

          if (!startCoords) {
            this.routeError = 'Kunne ikke hente din posisjon.'
            this.showNotification('Kunne ikke hente din posisjon.')
            return
          }
        }

        const endCoords = [markerData.lat, markerData.lng]

        await this.generateRoute(startCoords, endCoords)

        this.showNotification(`Rute til ${markerData.name || 'markør'} generert`)
      } catch (error) {
        console.error('Error creating route to marker:', error)
        this.routeError = 'Kunne ikke generere rute. ' + (error.message || '')
        this.showNotification('Kunne ikke generere rute.')
      }
    },

    /**
     * Get user's current position as a promise.
     *
     * @returns {Promise<Array<number>|null>} User position as [lat, lng] or null if failed
     */
    async getUserPosition() {
      try {
        return await GeolocationService.getUserLocation()
      } catch (error) {
        console.error('Error getting user position:', error)
        this.routeError =
          'Kunne ikke hente din posisjon: ' + GeolocationService.getErrorMessage(error)
        return null
      }
    },

    /**
     * Show a temporary notification message.
     *
     * @param {string} message - Message to display
     */
    showNotification(message) {
      this.notification = message

      if (this.notificationTimeout) {
        clearTimeout(this.notificationTimeout)
      }

      this.notificationTimeout = setTimeout(() => {
        this.notification = null
      }, 3000)
    },

    /**
     * Initialize markers and their layer groups.
     */
    async initMarkers() {
      this.isLoadingMarkers = true
      this.markersLoadError = null

      try {
        await this.resetMarkerState()
        await this.fetchAndInitializeMarkerTypes()
        await this.fetchAndDisplayMarkers()

        this.initialMarkersLoaded = true

        this.setupMapEventListeners()
      } catch (error) {
        this.handleMarkerInitError(error)
      } finally {
        this.isLoadingMarkers = false
      }
    },

    /**
     * Reset marker state to prepare for initialization.
     */
    async resetMarkerState() {
      this.removeAllMarkerLayers()

      this.markerLayers = {}
      this.markerData = {}
    },

    /**
     * Fetch and initialize marker types.
     */
    async fetchAndInitializeMarkerTypes() {
      const types = await MarkerService.fetchAndProcessMarkerTypes(this.cachedMarkerTypes)

      this.cachedMarkerTypes = types

      this.markerTypes = types

      this.markerLayers = MarkerConfigService.createMarkerLayerGroups(this.markerTypes)
    },

    /**
     * Handle errors during marker initialization.
     *
     * @param {Error} error - The error that occurred
     */
    handleMarkerInitError(error) {
      console.error('Error initializing markers:', error)
      this.markersLoadError = 'Failed to load markers. Please try again later.'

      this.markerTypes = this.markerTypes || []
      this.markerLayers = {}
      this.markerData = {}
    },

    /**
     * Remove all marker layers from the map (but keep layer groups).
     */
    removeAllMarkerLayers() {
      if (!this.map) return

      Object.values(this.markerLayers).forEach((layer) => {
        if (layer) {
          layer.removeFrom(this.map)
        }
      })
    },

    /**
     * Set visibility for all marker types.
     *
     * @param {boolean} isVisible - Whether markers should be visible
     */
    setAllMarkersVisibility(isVisible) {
      if (!this.map) return

      this.markerTypes.forEach((markerType) => {
        markerType.visible = isVisible

        const layer = this.markerLayers[markerType.id]
        if (!layer) return

        if (isVisible) {
          layer.addTo(this.map)
        } else {
          layer.removeFrom(this.map)
        }
      })

      this.resizeMap()
    },

    /**
     * Toggle visibility for a specific marker type.
     *
     * @param {string} markerId - ID of the marker type to toggle
     */
    toggleMarkerVisibility(markerId) {
      if (!this.map) return

      const markerType = this.markerTypes.find((type) => type.id === markerId)
      if (!markerType) return

      markerType.visible = !markerType.visible

      const layer = this.markerLayers[markerId]
      if (!layer) return

      if (markerType.visible) {
        layer.addTo(this.map)
      } else {
        layer.removeFrom(this.map)
      }

      this.resizeMap()
    },

    /**
     * Initialize incidents and incident layer.
     */
    async initIncidents() {
      if (!this.map) return

      this.incidentLayer = L.layerGroup().addTo(this.map)

      if (!this.incidentLayer) {
        this.incidentLayer = L.layerGroup().addTo(this.map)
      } else {
        this.incidentLayer.clearLayers()
      }

      await this.loadIncidents()
    },

    /**
     * Refresh incidents on the map.
     *
     * @returns {Promise<boolean>} Success status
     */
    async refreshIncidents() {
      if (!this.map || !this.incidentLayer) return

      try {
        this.incidentLayer.clearLayers()

        this.incidents = await IncidentMapService.fetchIncidents()

        this.updateIncidentsOnMap()

        return true
      } catch (error) {
        console.error('Error refreshing incidents:', error)
        return false
      }
    },

    /**
     * Load incidents from API and add to map.
     */
    async loadIncidents() {
      if (!this.map || !this.incidentLayer) return

      try {
        this.incidents = await IncidentMapService.fetchIncidents()

        this.updateIncidentsOnMap()
      } catch (error) {
        this.handleIncidentLoadError(error)
      }
    },

    /**
     * Handle errors during incident loading.
     *
     * @param {Error} error - The error that occurred
     */
    handleIncidentLoadError(error) {
      console.error('Error loading incidents:', error)
      this.incidentsLoadError = `Failed to load incidents: ${error.message}. Please check that the API is running and accessible.`
      this.incidents = []
    },

    /**
     * Update incidents on the map.
     */
    updateIncidentsOnMap() {
      if (!this.map || !this.incidentLayer) return

      this.incidentLayer.clearLayers()

      const editingIncidentId = useIncidentAdminStore().editingIncidentId

      this.incidents.forEach((incident) => {
        if (incident.id === editingIncidentId) return

        const circleGroup = IncidentConfigService.createIncidentCircles(incident, this.map)
        if (circleGroup) {
          this.incidentLayer.addLayer(circleGroup)
        }
      })
    },

    /**
     * Toggle visibility of the incident layer.
     *
     * @param {boolean} isVisible - Whether incidents should be visible
     */
    setIncidentsVisibility(isVisible) {
      if (!this.map || !this.incidentLayer) return

      if (isVisible) {
        this.incidentLayer.addTo(this.map)
      } else {
        this.incidentLayer.removeFrom(this.map)
      }
    },

    /**
     * Resize the map when container dimensions change.
     */
    resizeMap() {
      MapService.invalidateMapSize(this.map)
    },

    /**
     * Clean up resources when component is unmounted.
     */
    cleanupMap() {
      this.clearRoute()
      this.cleanupEventListeners()
      this.cleanupMapLayers()
      this.resetState()
    },

    /**
     * Clean up event listeners.
     */
    cleanupEventListeners() {
      if (this.mapMoveCleanup) {
        this.mapMoveCleanup()
        this.mapMoveCleanup = null
      }
    },

    /**
     * Clean up map layers.
     */
    cleanupMapLayers() {
      this.clearRoute()

      this.removeAllMarkerLayers()

      if (this.incidentLayer && this.map) {
        this.incidentLayer.clearLayers()
        this.incidentLayer.removeFrom(this.map)
        this.incidentLayer = null
      }

      if (this.map) {
        this.map.off()
        MapService.cleanupMap(this.map)
        this.map = null
      }
    },

    /**
     * Reset state values.
     */
    resetState() {
      this.markerLayers = {}
      this.markerData = {}
      this.markerTypes = []
      this.incidents = []
      this.initialMarkersLoaded = false
    },

    /**
     * Generate and display a route on the map.
     *
     * @param {Array<number>} startCoords - Starting coordinates [lat, lng]
     * @param {Array<number>} endCoords - Destination coordinates [lat, lng]
     */
    async generateRoute(startCoords, endCoords) {
      if (!this.map || !startCoords || !endCoords) {
        console.error('Cannot generate route: missing map or coordinates', {
          map: !!this.map,
          startCoords,
          endCoords,
        })
        return
      }


      try {
        this.routeStart = startCoords
        this.routeEnd = endCoords

        const RoutingService = await import('@/service/map/routingService').then((m) => m.default)

        this.activeRoute = RoutingService.showRoute(this.map, startCoords, endCoords)

        const bounds = L.latLngBounds([
          L.latLng(startCoords[0], startCoords[1]),
          L.latLng(endCoords[0], endCoords[1]),
        ]).pad(0.3)

        this.map.fitBounds(bounds)

      } catch (error) {
        console.error('Error generating route:', error)
      }
    },

    /**
     * Clear the current route.
     */
    clearRoute() {
      RoutingService.clearRoute()
      this.activeRoute = null
      this.routeStart = this.routeEnd = null
    },

    /**
     * Search for places and addresses.
     *
     * @param {string} query - The search query
     * @returns {Promise<SearchResult[]>} Search results
     */
    async searchPlaces(query) {
      if (!query || query.trim() === '') {
        this.searchResults = []
        this.searchError = null
        this.isSearching = false
        return []
      }

      this.isSearching = true
      this.searchError = null

      try {
        const results = await GeocodingService.searchPlaces(query)
        this.searchResults = results
        return results
      } catch (error) {
        console.error('Error searching places:', error)
        this.searchError = 'Failed to search places. Please try again later.'
        this.searchResults = []
        return []
      } finally {
        this.isSearching = false
      }
    },

    /**
     * Go to a location on the map.
     *
     * @param {Object} location - Location with lat and lng
     * @param {number} zoomLevel - Zoom level to set (optional)
     */
    goToLocation(location, zoomLevel = null) {
      if (!this.map || !location || !location.lat || !location.lng) return

      this.map.setView([location.lat, location.lng], zoomLevel)

      this.clearSearchResultMarker()

      this.createSearchResultMarker(location)

      this.showNotification(`Gikk til ${location.name || 'valgt plassering'}`)
    },

    /**
     * Create a marker for a search result.
     *
     * @param {Object} location - Location to mark
     */
    createSearchResultMarker(location) {
      if (!this.map || !location) return

      const searchIcon = L.divIcon({
        className: 'custom-div-icon search-result-icon',
        html: `<div style="background-color: #3498db; width: 20px; height: 20px; border-radius: 50%;"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      })

      this.searchResultMarker = L.marker([location.lat, location.lng], {
        icon: searchIcon,
        zIndexOffset: 1000,
      }).addTo(this.map)

    },

    /**
     * Clear the search result marker from the map.
     */
    clearSearchResultMarker() {
      if (this.searchResultMarker && this.map) {
        this.searchResultMarker.removeFrom(this.map)
        this.searchResultMarker = null
      }
      this.selectedSearchResult = null
    },

    /**
     * Handle a search result selection.
     *
     * @param {Object} result - The selected search result
     */
    selectSearchResult(result) {
      if (!result) return

      this.goToLocation(result, 16)
      this.searchResults = []
    },

    /**
     * Fetch all markers for admin interface.
     */
    async fetchMarkers() {
      this.isLoading = true
      this.error = null

      try {
        const markers = await MarkerAdminService.fetchAllMarkersForAdmin()
        this.markers = markers.map((marker) => ({
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
          longitude: marker.longitude,
        }))
        this.applyFilters()

        if (this.isEditing && this.markerFormData.id) {
          this.setEditingMarkerId(this.markerFormData.id)
        }
      } catch (error) {
        this.error = 'Kunne ikke laste markører. Vennligst prøv igjen senere.'
        console.error('Error in fetchMarkers:', error)
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Apply search and filters to markers.
     */
    applyFilters() {
      this.filteredMarkers = this.markers.filter((marker) => {
        const matchesSearch =
          this.searchTerm === '' ||
          (marker.name && marker.name.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.address &&
            marker.address.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.postalCode && marker.postalCode.toString().includes(this.searchTerm)) ||
          (marker.city && marker.city.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.description &&
            marker.description.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.contactInfo &&
            marker.contactInfo.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.openingHours &&
            marker.openingHours.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.type && marker.type.toLowerCase().includes(this.searchTerm.toLowerCase())) ||
          (marker.latitude && marker.latitude.toString().includes(this.searchTerm)) ||
          (marker.longitude && marker.longitude.toString().includes(this.searchTerm))

        const matchesType = this.filterType === '' || marker.type === this.filterType

        return matchesSearch && matchesType
      })
    },

    /**
     * Set search term and apply filters.
     *
     * @param {string} term - Search term to filter by
     */
    setSearchTerm(term) {
      this.searchTerm = term
      this.applyFilters()
    },

    /**
     * Set filter type and apply filters.
     *
     * @param {string} type - Type filter to apply
     */
    setFilterType(type) {
      this.filterType = type
      this.applyFilters()
    },

    /**
     * Reset form data for creating a new marker.
     */
    initNewMarker() {
      this.isCreating = true
      this.isEditing = false
      this.error = null
      this.success = null

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
        longitude: 10.3951,
      }
    },

    /**
     * Load marker data into form for editing.
     *
     * @param {MarkerFormData} marker - Marker data to edit
     */
    editMarker(marker) {
      this.setEditingMarkerId(marker.id)

      const [street, postal, city] = (marker.address || '').split(',').map((p) => p.trim())

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
        longitude: marker.longitude,
      }

      this.isEditing = true
      this.isCreating = false
      this.error = null
      this.success = null
    },

    /**
     * Create a new marker.
     *
     * @returns {Promise<boolean>} Success status
     */
    async createMarker() {
      this.isLoading = true
      this.error = null

      try {
        const { id, address, postalCode, city, ...rest } = this.markerFormData

        const requestData = {
          ...rest,
          address: `${address}, ${postalCode}, ${city}`,
        }

        await MarkerAdminService.createMarker(requestData)
        await this.fetchMarkers()

        this.isCreating = false

        return true
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error
        } else {
          this.error = 'Kunne ikke opprette markør. Vennligst prøv igjen senere.'
        }
        console.error('Error in createMarker:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update an existing marker.
     *
     * @returns {Promise<boolean>} Success status
     */
    async updateMarker() {
      this.isLoading = true
      this.error = null

      try {
        const { id, address, postalCode, city, ...rest } = this.markerFormData

        const requestData = {
          ...rest,
          address: `${address}, ${postalCode}, ${city}`,
        }

        await MarkerAdminService.updateMarker(id, requestData)

        await this.fetchMarkers()

        this.isEditing = false

        return true
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error
        } else {
          this.error = 'Kunne ikke oppdatere markør. Vennligst prøv igjen senere.'
        }
        console.error('Error in updateMarker:', error)
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Save marker (create or update).
     *
     * @returns {Promise<boolean>} Success status
     */
    async saveMarker() {
      let success = false

      if (this.isCreating) {
        try {
          success = await this.createMarker()
          toast({
            title: 'Kart markør opprettet',
            description: 'Du har opprettet en ny kart markør.',
            variant: 'success',
          })
        } catch (error) {
          console.error('Error in createMarker:', error)
          toast({
            title: 'Feil',
            description: 'Klarte ikke opprettet en ny kart markør.',
            variant: 'destructive',
          })
        }
      } else if (this.isEditing) {
        try {
          success = await this.updateMarker()
          toast({
            title: 'Kart markør oppdatert ',
            description: 'Du har oppdatert en kart markør.',
            variant: 'success',
          })
        } catch (error) {
          console.error('Error in updateMarker:', error)
          toast({
            title: 'Feil',
            description: 'Klarte ikke oppdatere kart markør.',
            variant: 'destructive',
          })
        }
      }

      if (success) {
        this.clearEditingMarkerId()
        this.clearAllMarkerLayers()

        this.addMarkersToLayers()
        await this.fetchAndDisplayMarkers()
      }

      return success
    },

    /**
     * Delete a marker.
     *
     * @param {string} id - ID of the marker to delete
     * @returns {Promise<boolean>} Success status
     */
    async deleteMarker(id) {
      this.isLoading = true
      this.error = null

      try {
        await MarkerAdminService.deleteMarker(id)

        this.markers = this.markers.filter((marker) => marker.id !== id)
        this.applyFilters()

        this.clearEditingMarkerId()

        await this.fetchMarkers()

        await this.fetchAndDisplayMarkers()

        toast({
          title: 'Slettet kart markør',
          description: 'Du har slettet en kart markør.',
          variant: 'success',
        })

        if (this.isEditing && this.markerFormData.id === id) {
          this.isEditing = false
        }

        return true
      } catch (error) {
        if (error.response && error.response.data && error.response.data.error) {
          this.error = error.response.data.error
        } else {
          this.error = 'Kunne ikke slette markør. Vennligst prøv igjen senere.'
        }
        console.error('Error in deleteMarker:', error)
        toast({
          title: 'Feil',
          description: 'Klarte ikke slette kart markør.',
          variant: 'destructive',
        })
        return false
      } finally {
        this.isLoading = false
      }
    },

    /**
     * Update marker address based on coordinates using reverse geocoding.
     *
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     * @returns {Promise<Object|null>} Address information or null if failed
     */
    async updateAddressFromCoordinates(lat, lng) {
      try {
        const addressInfo = await GeocodingService.reverseGeocode(lat, lng)

        if (addressInfo && addressInfo.address) {
          const { address } = addressInfo

          const streetAddress = address.road || address.footway || address.pedestrian || ''
          const houseNumber = address.house_number || ''
          const formattedStreet = houseNumber ? `${streetAddress} ${houseNumber}` : streetAddress

          this.markerFormData.address = formattedStreet
          this.markerFormData.postalCode = address.postcode || ''
          this.markerFormData.city =
            address.city || address.town || address.village || address.suburb || ''

          return {
            address: formattedStreet,
            postalCode: address.postcode || '',
            city: this.markerFormData.city,
          }
        }

        return null
      } catch (error) {
        console.error('Error in updateAddressFromCoordinates:', error)
        return null
      }
    },

    /**
     * Update marker coordinates.
     *
     * @param {number} lat - Latitude
     * @param {number} lng - Longitude
     */
    updateMarkerCoordinates(lat, lng) {
      this.markerFormData.latitude = lat
      this.markerFormData.longitude = lng

      if (this.isEditing) {
        const marker = this.markers.find((m) => m.id === this.markerFormData.id)
        if (marker) {
          marker.latitude = this.markerFormData.latitude
          marker.longitude = this.markerFormData.longitude
        }
      }
    },

    /**
     * Update all marker popups with current sharing status.
     *
     * @param {boolean|null} isSharing - Current sharing status, null to use localStorage value
     */
    updateMarkerPopups(isSharing = null) {
      if (!this.map) return

      const sharingStatus =
        isSharing !== null ? isSharing : localStorage.getItem('isSharing') === 'true'

      Object.entries(this.markerData).forEach(([typeId, markers]) => {
        if (!this.markerLayers[typeId]) return

        const layer = this.markerLayers[typeId]
        layer.eachLayer((marker) => {
          const markerLatLng = marker.getLatLng()
          const markerData = markers.find(
            (m) => m.lat === markerLatLng.lat && m.lng === markerLatLng.lng,
          )

          if (markerData && marker.getPopup()) {
            const popupContent = MarkerConfigService.createMarkerPopupContent(
              markerData,
              sharingStatus,
            )
            marker.getPopup().setContent(popupContent)
          }
        })
      })
    },

    /**
     * Update coordinates based on address using geocoding.
     *
     * @param {string} addressQuery - The address string to geocode
     * @returns {Promise<Object|null>} - Coordinates or null if not found
     */
    async updateCoordinatesFromAddress(addressQuery) {
      try {
        const results = await GeocodingService.searchPlaces(addressQuery, {
          limit: 1,
          countryCode: 'no',
        })

        if (results && results.length > 0) {
          const result = results[0]
          const lat = result.lat
          const lng = result.lng

          this.markerFormData.latitude = lat
          this.markerFormData.longitude = lng

          if (this.isEditing) {
            const marker = this.markers.find((m) => m.id === this.markerFormData.id)
            if (marker) {
              marker.latitude = lat
              marker.longitude = lng
            }
          }

          return { lat, lng }
        }

        return null
      } catch (error) {
        console.error('Error in updateCoordinatesFromAddress:', error)
        return null
      }
    },

    /**
     * Cancel editing/creating.
     */
    async cancelEdit() {
      this.isEditing = false
      this.isCreating = false
      this.error = null
      this.success = null

      this.editingMarkerId = null

      await this.fetchAndDisplayMarkers(true)
      await this.fetchMarkers()
    },

    /**
     * Clear the editing marker ID
     */
    async clearEditingMarkerId() {
      const maxRetries = 3
      let retryCount = 0
      let success = false

      while (!success && retryCount < maxRetries) {
        try {
          const previousId = this.editingMarkerId
          this.editingMarkerId = null

          this.clearAllMarkerLayers()

          await new Promise((resolve) => setTimeout(resolve, 50 * (retryCount + 1)))

          await this.fetchAndDisplayMarkers()

          if (this.editingMarkerId !== null) {
            console.warn('Race condition detected: editingMarkerId was changed during operation')
            throw new Error('Race condition: editingMarkerId changed during operation')
          }

          if (this.map) {
            setTimeout(() => {
              if (this.map) this.map.invalidateSize()
            }, 50)
          }
          await this.fetchAndDisplayMarkers()

          success = true
        } catch (error) {
          console.warn(`Attempt ${retryCount + 1} failed:`, error)
          retryCount++

          if (retryCount < maxRetries) {
            const delay = 200 * retryCount
            await new Promise((resolve) => setTimeout(resolve, delay))
          }
        }
      }

      if (!success) {
        console.error('Failed to clear editing marker after', maxRetries, 'attempts')
        try {
          this.editingMarkerId = null

          if (this.map) {
            const bounds = MapService.getMapBounds(this.map)
            this.markerData = await MarkerService.fetchAllMarkers(bounds)

            Object.values(this.markerLayers).forEach((layer) => {
              if (layer && this.map) {
                layer.removeFrom(this.map)
              }
            })

            this.markerLayers = {}

            this.markerLayers = MarkerConfigService.createMarkerLayerGroups(this.markerTypes)

            this.addMarkersToLayers()
          } else {
            console.warn('No map reference for fallback approach')
          }
        } catch (fallbackError) {
          console.error('Fallback approach also failed:', fallbackError)
        }
      }

      return success
    },

    /**
     * Clear all markers from their layers
     */
    async clearAllMarkerLayers() {
      try {
        for (const [key, layer] of Object.entries(this.markerLayers)) {
          if (layer) {
            layer.clearLayers()
          } else {
            console.warn(`Layer ${key} is null or undefined`)
          }
        }
      } catch (error) {
        console.error('Error in clearAllMarkerLayers:', error)
      } finally {
        console.groupEnd()
      }

      await this.fetchAndDisplayMarkers()
    },

    /**
     * Fetch marker data and display on map
     */
    async fetchAndDisplayMarkers() {
      try {
        const bounds = this.map ? MapService.getMapBounds(this.map) : null
        this.markerData = await MarkerService.fetchAllMarkers(bounds)

        await this.addMarkersToLayers()

        return true
      } catch (error) {
        console.error('Error in fetchAndDisplayMarkers:', error)
        return false
      } finally {
        console.groupEnd()
      }
    },

    /**
     * Add markers to layers
     */
    async addMarkersToLayers() {
      try {
        const visibleData = this.visibleMarkerData

        for (const [typeId, markers] of Object.entries(visibleData)) {
          if (!this.markerLayers[typeId]) {
            this.markerLayers[typeId] = L.layerGroup()
          }

          let markerType

          if (typeId === 'ADMIN') {
            this.markerLayers[typeId].clearLayers()

            markers.forEach((markerData) => {
              try {
                const configs = MarkerConfigService.getMarkerConfigs()
                const config = configs[markerData.type]
                if (!config) {
                  console.warn(`No config found for admin marker type: ${markerData.type}`)
                  return
                }

                const icon = MarkerConfigService.createLeafletIcon(config.iconType, config.color)

                const marker = L.marker([markerData.lat, markerData.lng], { icon })

                const popupContent = MarkerConfigService.createMarkerPopupContent(markerData)
                marker.bindPopup(popupContent)

                this.markerLayers[typeId].addLayer(marker)
              } catch (error) {
                console.error(`Error processing admin marker:`, error, markerData)
              }
            })
          } else {
            markerType = this.markerTypes.find((type) => type.id === typeId)
            if (!markerType) {
              console.warn(`No marker type found for type id: ${typeId}`)
              continue
            }

            this.markerLayers[typeId].clearLayers()

            markers.forEach((markerData) => {
              try {
                const marker = this.createMarkerWithPopup(markerData, markerType)
                this.markerLayers[typeId].addLayer(marker)
              } catch (error) {
                console.error(`Error adding marker to layer:`, error, markerData)
              }
            })
          }
          if ((typeId === 'ADMIN' || (markerType && markerType.visible)) && this.map) {
            this.markerLayers[typeId].addTo(this.map)
          } else {
          }
        }
      } catch (error) {
        console.error('Error in addMarkersToLayers:', error)
      } finally {
        console.groupEnd()
      }
    },

    /**
     * Clear success message
     */
    clearSuccess() {
      this.success = null
    },

    /**
     * Clear error message
     */
    clearError() {
      this.error = null
    },

    /**
     * Set admin markers to be displayed on the map
     * @param {Array} adminMarkers - Array of admin marker objects
     */
    setAdminMarkers(adminMarkers) {
      if (!this.markerData['ADMIN']) {
        this.markerData['ADMIN'] = []
      }

      this.markerData['ADMIN'] = adminMarkers.filter(
        (marker) => !marker.editingMarkerId || marker.id !== marker.editingMarkerId,
      )

      if (!this.markerLayers['ADMIN']) {
        this.markerLayers['ADMIN'] = L.layerGroup()

        this.markerTypes.some((type) => type.id === 'ADMIN')
      }

      this.refreshMarkerLayers()
    },
  },
})
