// service/map/markerConfigService.js
import L from 'leaflet';
import {
  Heart,
  UtensilsCrossed,
  Home,
  Building,
  Users
} from 'lucide-vue-next';

/**
 * Service for marker configuration and icon generation
 */
class MarkerConfigService {
  /**
   * Get SVG path for Lucide icon
   * @param {string} iconType - Icon type name
   * @returns {string} SVG path
   */
  getSVGPath(iconType) {
    switch (iconType) {
      case 'Heart':
        return '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"></path>';
      case 'Stethoscope':
        return '<path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3"></path><path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4"></path><circle cx="20" cy="10" r="2"></circle>';
      case 'UtensilsCrossed':
        return '<path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8"></path><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Zm0 0 7 7"></path><path d="m2.1 21.8 6.4-6.3"></path><path d="m19 5-7 7"></path>';
      case 'Home':
        return '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>';
      case 'Building':
        return '<rect width="16" height="20" x="4" y="2" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path>';
      case 'Users':
        return '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>';
      default:
        return '';
    }
  }

  /**
   * Create Leaflet icon for markers
   * @param {string} iconType - Icon type name
   * @param {string} color - Icon color
   * @returns {L.DivIcon} Leaflet icon
   */
  createLeafletIcon(iconType, color) {
    return L.divIcon({
      html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon">${this.getSVGPath(iconType)}</svg>`,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
      popupAnchor: [0, -30]
    });
  }

  /**
   * Get marker type configurations
   * @returns {Object} Marker configurations by type ID
   */
  getMarkerConfigs() {
    return {
      'HEARTSTARTER': {
        iconType: 'Heart',
        lucideIcon: Heart,
        color: '#d81b60',
        norwegianName: 'Hjertestarter'
      },
      'FOODSTATION': {
        iconType: 'UtensilsCrossed',
        lucideIcon: UtensilsCrossed,
        color: '#7b1fa2',
        norwegianName: 'Matstasjon'
      },
      'SHELTER': {
        iconType: 'Home',
        lucideIcon: Home,
        color: '#1976d2',
        norwegianName: 'Tilfluktsrom'
      },
      'HOSPITAL': {
        iconType: 'Building',
        lucideIcon: Building,
        color: '#388e3c',
        norwegianName: 'Sykehus'
      },
      'MEETINGPLACE': {
        iconType: 'Users',
        lucideIcon: Users,
        color: '#f57c00',
        norwegianName: 'Møteplass'
      }
    };
  }

  /**
   * Format marker type ID to readable title
   * @param {string} typeId - Marker type ID
   * @returns {string} Formatted title
   */
  formatTypeTitle(typeId) {
    const markerConfig = this.getMarkerConfigs();

    // If markerConfig has a Norwegian name for this type, use it
    if (markerConfig[typeId]?.norwegianName) {
      return markerConfig[typeId].norwegianName;
    }

    // For all-caps IDs, convert to Title Case as fallback
    if (typeId === typeId.toUpperCase()) {
      return typeId.charAt(0).toUpperCase() +
        typeId.slice(1).toLowerCase().replace(/([A-Z])/g, ' $1').trim();
    }

    // For Norwegian terms, just capitalize first letter
    return typeId.charAt(0).toUpperCase() + typeId.slice(1);
  }

  /**
   * Process marker types with icon information
   * @param {Array} types - Basic marker type information
   * @returns {Array} Processed marker types with icons
   */
  processMarkerTypes(types) {
    const markerConfig = this.getMarkerConfigs();

    // First filter out types that don't have icon configurations
    const validTypes = types.filter(type => {
      if (!markerConfig[type.id]) {
        console.warn(`Unknown marker type: ${type.id} - this marker type will be excluded.`);
        return false;
      }
      return true;
    });

    // Then map the valid types to include their icon information
    return validTypes.map(type => ({
      ...type,
      icon: this.createLeafletIcon(
        markerConfig[type.id].iconType,
        markerConfig[type.id].color
      ),
      lucideIcon: markerConfig[type.id].lucideIcon,
      color: markerConfig[type.id].color
    }));
  }

  /**
   * Create layer groups for marker types
   * @param {Array} markerTypes - Array of marker types
   * @returns {Object} Object mapping type IDs to layer groups
   */
  createMarkerLayerGroups(markerTypes) {
    const markerLayers = {};
    markerTypes.forEach(markerType => {
      markerLayers[markerType.id] = L.layerGroup();
    });
    return markerLayers;
  }

  /**
   * Create marker popup content with a route button
   * @param {Object} markerData - Marker data
   * @returns {string} HTML content for popup
   */
  createMarkerPopupContent(markerData) {
    return `
    <div class="marker-popup">
      <h3><strong>${markerData.name || ''}</strong></h3>
      ${markerData.address ? `<p><strong>Adresse:</strong> ${markerData.address}</p>` : ''}
      ${markerData.opening_hours ? `<p><strong>Åpningstider:</strong> ${markerData.opening_hours}</p>` : ''}
      ${markerData.contact_info ? `<p><strong>Kontakt:</strong> ${markerData.contact_info}</p>` : ''}
      ${markerData.description ? `<p><strong>Beskrivelse:</strong> ${markerData.description}</p>` : ''}
      <div class="marker-popup-actions">
        <button class="marker-route-button" onclick="window.createRouteToMarker(${JSON.stringify(markerData).replace(/"/g, '&quot;')})">
          Vis rute hit
        </button>
      </div>
    </div>
  `;
  }
}

export default new MarkerConfigService();
