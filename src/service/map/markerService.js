// service/map/markerService.js
import L from 'leaflet';
import {
  Heart,
  Stethoscope,
  UtensilsCrossed,
  Home,
  Building,
  Users
} from 'lucide-vue-next';

// Create a custom Leaflet icon using an HTML element
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

export default {
  getMarkerTypes() {
    return [
      {
        id: 'nødhjelp',
        name: 'Nødhjelp',
        icon: createLeafletIcon('Stethoscope', '#e53935'),
        lucideIcon: Stethoscope,
        color: '#e53935',
        visible: true
      },
      {
        id: 'hjertestarter',
        name: 'Hjertestarter',
        icon: createLeafletIcon('Heart', '#d81b60'),
        lucideIcon: Heart,
        color: '#d81b60',
        visible: true
      },
      {
        id: 'matstasjon',
        name: 'Matstasjon',
        icon: createLeafletIcon('UtensilsCrossed', '#7b1fa2'),
        lucideIcon: UtensilsCrossed,
        color: '#7b1fa2',
        visible: true
      },
      {
        id: 'tilfluktsrom',
        name: 'Tilfluktsrom',
        icon: createLeafletIcon('Home', '#1976d2'),
        lucideIcon: Home,
        color: '#1976d2',
        visible: true
      },
      {
        id: 'sykehus',
        name: 'Sykehus',
        icon: createLeafletIcon('Building', '#388e3c'),
        lucideIcon: Building,
        color: '#388e3c',
        visible: true
      },
      {
        id: 'møteplass',
        name: 'Møteplass',
        icon: createLeafletIcon('Users', '#f57c00'),
        lucideIcon: Users,
        color: '#f57c00',
        visible: true
      }
    ];
  },

  // Rest of the code remains the same
  getMarkerData() {
    return {
      'nødhjelp': [
        { lat: 63.4275, lng: 10.3975, name: 'Nødhjelp Sentrum' },
        { lat: 63.4350, lng: 10.4050, name: 'Nødhjelp Øst' }
      ],
      'hjertestarter': [
        { lat: 63.4305, lng: 10.3920, name: 'Hjertestarter Torget' },
        { lat: 63.4285, lng: 10.3990, name: 'Hjertestarter Kjøpesenter' }
      ],
      'matstasjon': [
        { lat: 63.4330, lng: 10.4030, name: 'Matstasjon 1' },
        { lat: 63.4290, lng: 10.3880, name: 'Matstasjon 2' }
      ],
      'tilfluktsrom': [
        { lat: 63.4315, lng: 10.4010, name: 'Tilfluktsrom Sentrum' }
      ],
      'sykehus': [
        { lat: 63.4230, lng: 10.3960, name: 'St. Olavs Hospital' }
      ],
      'møteplass': [
        { lat: 63.4295, lng: 10.3930, name: 'Møteplass Torget' },
        { lat: 63.4325, lng: 10.4080, name: 'Møteplass Bakklandet' }
      ]
    };
  }
};
