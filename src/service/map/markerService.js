// service/map/markerService.js
import L from 'leaflet';
import BaseService from '@/service/baseService';
import {
  Heart,
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

// Map of icon configurations for each marker type - with Norwegian names
const iconConfig = {
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

class MarkerService extends BaseService {
  constructor() {
    super('map-icons');
  }

  // Default map coordinates - Trondheim, Norway
  defaultLat = 63.4305;
  defaultLng = 10.3951;
  defaultRadius = 10; // 10 km radius if no map bounds

  // Cache for marker types to avoid unnecessary API calls
  cachedMarkerTypes = null;

  // Calculate distance between two points in km (Haversine formula)
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in km
    return distance;
  }

  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Calculate radius in km based on map bounds
  calculateRadiusFromBounds(bounds) {
    if (!bounds) {
      return this.defaultRadius;
    }

    // Get the center of the map
    const center = bounds.getCenter();

    // Get the northeast corner of the bounds
    const northEast = bounds.getNorthEast();

    // Calculate the distance from center to the corner (in km)
    const radius = this.calculateDistance(
      center.lat, center.lng,
      northEast.lat, northEast.lng
    );

    // Add some buffer (20%) to ensure we get all markers in view
    return radius * 1.2;
  }

  // API methods
  async fetchMarkerTypes() {
    // If we have cached marker types, use them
    if (this.cachedMarkerTypes) {
      return this.cachedMarkerTypes;
    }

    try {
      console.log('Fetching marker types from backend');

      // First, we need to fetch all markers to determine the available types
      // Use default parameters for this initial fetch
      const allMarkers = await this.fetchAllMarkers(null);

      // Extract unique types from markers
      const typeSet = new Set();
      Object.keys(allMarkers).forEach(typeId => {
        typeSet.add(typeId);
      });

      // Convert to array of marker type objects
      const types = Array.from(typeSet).map(typeId => ({
        id: typeId,
        title: this.formatTypeTitle(typeId),
        visible: true
      }));

      // Process the API response to include icon information
      // First filter out types that don't have icon configurations
      const validTypes = types.filter(type => {
        if (!iconConfig[type.id]) {
          console.warn(`Unknown marker type: ${type.id} - this marker type will be excluded.`);
          return false;
        }
        return true;
      });

      // Then map the valid types to include their icon information
      const markerTypes = validTypes.map(type => ({
        ...type,
        icon: createLeafletIcon(
          iconConfig[type.id].iconType,
          iconConfig[type.id].color
        ),
        lucideIcon: iconConfig[type.id].lucideIcon,
        color: iconConfig[type.id].color
      }));

      // Cache the marker types
      this.cachedMarkerTypes = markerTypes;

      return markerTypes;
    } catch (error) {
      console.error('Error fetching marker types:', error);
      throw error; // Re-throw to let caller handle the error
    }
  }

  // Helper to format type ID into a readable title
  formatTypeTitle(typeId) {
    // If iconConfig has a Norwegian name for this type, use it
    if (iconConfig[typeId]?.norwegianName) {
      return iconConfig[typeId].norwegianName;
    }

    // For all-caps IDs, convert to Title Case as fallback
    if (typeId === typeId.toUpperCase()) {
      return typeId.charAt(0).toUpperCase() +
        typeId.slice(1).toLowerCase().replace(/([A-Z])/g, ' $1').trim();
    }

    // For Norwegian terms, just capitalize first letter
    return typeId.charAt(0).toUpperCase() + typeId.slice(1);
  }

  async fetchAllMarkers(mapBounds) {
    try {
      // Get the center and radius from map bounds or use defaults
      let latitude, longitude, radiusKm;

      if (mapBounds) {
        const center = mapBounds.getCenter();
        latitude = center.lat;
        longitude = center.lng;
        radiusKm = this.calculateRadiusFromBounds(mapBounds);
      } else {
        latitude = this.defaultLat;
        longitude = this.defaultLng;
        radiusKm = this.defaultRadius;
      }

      console.log(`Fetching markers from: ${this.buildUrl('')} with dynamic params:`, {
        latitude,
        longitude,
        radiusKm: Math.round(radiusKm * 10) / 10 // Round to 1 decimal place
      });

      // Get with dynamic parameters
      const response = await this.get('', {
        params: {
          latitude,
          longitude,
          radiusKm: Math.round(radiusKm * 10) / 10 // Round to 1 decimal place
        }
      });

      // Process the response and organize by marker type
      const markersByType = {};

      // Ensure we have a response
      if (!response || !Array.isArray(response)) {
        console.warn('API returned invalid response format:', response);
        throw new Error('Invalid API response format');
      }

      // Process API response
      response.forEach(marker => {
        if (!marker.type) {
          console.warn('Marker missing type property:', marker);
          return;
        }

        if (!markersByType[marker.type]) {
          markersByType[marker.type] = [];
        }

        markersByType[marker.type].push({
          id: marker.id,
          name: iconConfig[marker.type]?.norwegianName || '',
          address: marker.address || '',
          lat: marker.latitude,
          lng: marker.longitude,
          description: marker.description || '',
          opening_hours: marker.openingHours || '',
          contact_info: marker.contactInfo || ''
        });
      });

      console.log(`Loaded ${response.length} markers for radius ${radiusKm.toFixed(1)} km`);
      return markersByType;
    } catch (error) {
      console.error('Error fetching all markers:', error);
      throw error; // Re-throw to let caller handle the error
    }
  }
}

export default new MarkerService();
