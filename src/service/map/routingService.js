import L from 'leaflet';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import BaseService from '@/service/baseService';

class RoutingService extends BaseService {
  constructor() {
    super('routing');
    this.routingControl = null;
  }

  /**
   * Generate and display a route on the map
   *
   * @param {L.Map} map - The Leaflet map instance
   * @param {Array} startCoords - Starting coordinates [lat, lng]
   * @param {Array} endCoords - Destination coordinates [lat, lng]
   * @param {Object} options - Additional routing options
   * @returns {L.Routing.Control} The routing control instance
   */
  showRoute(map, startCoords, endCoords, options = {}) {
    console.log("RoutingService.showRoute called with:", { startCoords, endCoords });

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
          // Return null to hide the default markers since we already have our own
          return null;
        }
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
      console.log("Clearing existing route");
      this.routingControl.remove();
      this.routingControl = null;
    }
  }
}

export default new RoutingService();
