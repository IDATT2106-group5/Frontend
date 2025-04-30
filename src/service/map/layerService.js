import L from 'leaflet';

export default {
  getLayerDefinitions() {
    return {
      standard: {
        base: L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
      },
      satellite: {
        base: L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          maxZoom: 19,
          attribution: '&copy; ESRI'
        })
      },
      terrain: {
        base: L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          maxZoom: 17,
          attribution: '&copy; <a href="https://opentopomap.org">OpenTopoMap</a> contributors'
        })
      }
    };
  },

  getLayerOptions() {
    return [
      {
        id: 'standard',
        name: 'Trafikk',
        provider: 'standard'
      },
      {
        id: 'satellite',
        name: 'Satellitt',
        provider: 'satellite'
      },
      {
        id: 'terrain',
        name: 'Terreng',
        provider: 'terrain'
      }
    ];
  }
};
