import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import BaseService from '@/service/baseService';

class RoutingService extends BaseService {
  constructor() {
    super('routing');
    this.routingControl = null;
    this.routingContainer = null;
  }

  /**
   * Show route on the map between two coordinates.
   * @param {L.Map} map - The map instance
   * @param {Array} startCoords - Starting coordinates [lat, lng]
   * @param {Array} endCoords - Ending coordinates [lat, lng]
   * @param {Object} options - Optional configuration
   * @returns {L.Routing.Control} The routing control
   */
  showRoute(map, startCoords, endCoords, options = {}) {

    // Remove any existing route
    this.clearRoute();

    if (!map || !startCoords || !endCoords) {
      console.error("Missing required parameters for routing");
      return null;
    }

    try {
      const defaultOptions = {
        waypoints: [
          L.latLng(startCoords[0], startCoords[1]),
          L.latLng(endCoords[0], endCoords[1])
        ],
        routeWhileDragging: false,
        showAlternatives: false,
        fitSelectedRoutes: true,
        lineOptions: {
          styles: [
            { color: 'black', opacity: 0.15, weight: 9 },
            { color: '#2196F3', opacity: 0.8, weight: 6 },
            { color: 'white', opacity: 0.3, weight: 4 }
          ]
        },
        createMarker: function() {
          return null; // Don't show default markers
        },
        // These are the key settings to completely remove the instructions panel:
        show: false,
        collapsible: false,
        containerClassName: 'hide-completely', // This will be used to hide via CSS
        addWaypoints: false,
        draggableWaypoints: false
      };

      const mergedOptions = { ...defaultOptions, ...options };

      // Create and add the routing control
      this.routingControl = L.Routing.control(mergedOptions).addTo(map);

      return this.routingControl;
    } catch (error) {
      console.error("Error creating routing control:", error);
      return null;
    }
  }


  /**
   * Clear any existing route from the map
   */
  clearRoute() {

    if (this.routingControl) {
      try {
        // First detach any event listeners
        if (this.routingControl._map) {
          this.routingControl._map.off('zoomend', this.routingControl._onZoomEnd);
          this.routingControl._map.off('zoomstart', this.routingControl._onZoomStart);
        }

        this.routingControl.remove();
      } catch (error) {
        console.warn("Error removing routing control:", error);
      }
      this.routingControl = null;
    }
  }
}
export default new RoutingService();
