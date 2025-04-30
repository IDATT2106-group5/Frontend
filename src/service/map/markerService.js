// service/map/markerService.js
import L from 'leaflet';
import BaseService from '@/service/baseService';
import {
  Heart,
  Stethoscope,
  UtensilsCrossed,
  Home,
  Building,
  Users
} from 'lucide-vue-next';

// Function to create Leaflet icon for markers
const createLeafletIcon = (iconType, color) => {
  // Create a custom divIcon for Leaflet
  return L.divIcon({
    html: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide-icon">${getSVGPath(iconType)}</svg>`,
    className: 'custom-div-icon',
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30]
  });
};

// Map Lucide icons to their SVG paths
const getSVGPath = (iconType) => {
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
};

// Map of icon configurations for each marker type
const iconConfig = {
  'nødhjelp': {
    iconType: 'Stethoscope',
    lucideIcon: Stethoscope,
    color: '#e53935'
  },
  'hjertestarter': {
    iconType: 'Heart',
    lucideIcon: Heart,
    color: '#d81b60'
  },
  'matstasjon': {
    iconType: 'UtensilsCrossed',
    lucideIcon: UtensilsCrossed,
    color: '#7b1fa2'
  },
  'tilfluktsrom': {
    iconType: 'Home',
    lucideIcon: Home,
    color: '#1976d2'
  },
  'sykehus': {
    iconType: 'Building',
    lucideIcon: Building,
    color: '#388e3c'
  },
  'møteplass': {
    iconType: 'Users',
    lucideIcon: Users,
    color: '#f57c00'
  }
};

class MarkerService extends BaseService {
  constructor() {
    super('maps/markers'); // Use your actual API endpoint for markers
    // TODO... connect med edvard
  }

  // Method to get icon configurations
  getIconConfig() {
    return iconConfig;
  }

  // API methods
  async fetchMarkerTypes() {
    try {
      const types = await this.get('types');

      // Process the API response to include icon information
      return types.map(type => ({
        ...type,
        icon: createLeafletIcon(
          iconConfig[type.id]?.iconType || 'Building',
          iconConfig[type.id]?.color || '#000000'
        ),
        lucideIcon: iconConfig[type.id]?.lucideIcon || Building,
        color: iconConfig[type.id]?.color || '#000000'
      }));
    } catch (error) {
      console.error('Error fetching marker types:', error);
      throw error;
    }
  }

  async fetchAllMarkers() {
    try {
      return await this.get();
    } catch (error) {
      console.error('Error fetching all markers:', error);
      throw error;
    }
  }

  async fetchMarkersByType(typeId) {
    try {
      return await this.get(`type/${typeId}`);
    } catch (error) {
      console.error(`Error fetching markers of type ${typeId}:`, error);
      throw error;
    }
  }

  async createMarker(markerData) {
    try {
      return await this.post('', markerData);
    } catch (error) {
      console.error('Error creating marker:', error);
      throw error;
    }
  }

  async updateMarker(markerId, markerData) {
    try {
      return await this.put(`${markerId}`, markerData);
    } catch (error) {
      console.error(`Error updating marker ${markerId}:`, error);
      throw error;
    }
  }

  async deleteMarker(markerId) {
    try {
      return await this.deleteItem(`${markerId}`);
    } catch (error) {
      console.error(`Error deleting marker ${markerId}:`, error);
      throw error;
    }
  }
}

export default new MarkerService();
