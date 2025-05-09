// service/map/incidentConfigService.js
import L from 'leaflet';

/**
 * Service for incident configuration and visualization
 */
class IncidentConfigService {
  /**
   * Get severity level configurations
   * @returns {Object} Severity configurations by level
   */
  getSeverityLevels() {
    return {
      RED: {
        id: 'RED',
        name: 'Kritisk farenivå',
        color: '#FF3D33', // Red
        fillOpacity: 0.35,
        strokeWidth: 2,
        // Visual configuration for concentric circles
        visual: {
          // Each severity can have multiple circles with different radiusMultipliers
          circles: [
            { color: '#45D278', radiusMultiplier: 1.2, fillOpacity: 0.25, strokeWidth: 1 },  // Green (outermost)
            { color: '#FFC700', radiusMultiplier: 1.1, fillOpacity: 0.3, strokeWidth: 1.5 }, // Yellow (middle)
            { color: '#FF3D33', radiusMultiplier: 1.0, fillOpacity: 0.35, strokeWidth: 2 }   // Red (innermost)
          ]
        }
      },
      YELLOW: {
        id: 'YELLOW',
        name: 'Forhøyet farenivå',
        color: '#FFC700', // Yellow
        fillOpacity: 0.3,
        strokeWidth: 1.5,
        // Visual configuration for concentric circles
        visual: {
          circles: [
            { color: '#45D278', radiusMultiplier: 1.1, fillOpacity: 0.25, strokeWidth: 1 },  // Green (outermost)
            { color: '#FFC700', radiusMultiplier: 1.0, fillOpacity: 0.3, strokeWidth: 1.5 }  // Yellow (innermost)
          ]
        }
      },
      GREEN: {
        id: 'GREEN',
        name: 'Lavt farenivå',
        color: '#45D278', // Green
        fillOpacity: 0.25,
        strokeWidth: 1,
        // Visual configuration for concentric circles
        visual: {
          circles: [
            { color: '#45D278', radiusMultiplier: 1.0, fillOpacity: 0.25, strokeWidth: 1 }  // Green (only circle)
          ]
        }
      }
    };
  }

  /**
   * Create a popup content for an incident
   * @param {Object} incident - Incident data
   * @param {Object} config - Severity configuration
   * @returns {string} HTML content for the popup
   */
  createIncidentPopupContent(incident, config) {
    return `
      <div class="incident-popup">
        ${incident.name ? `<h3>${incident.name}</h3>` : ''}
        ${incident.description ? `<p>${incident.description}</p>` : ''}
        ${incident.startedAt ? `<p><strong>Startet:</strong> ${new Date(incident.startedAt).toLocaleString()}</p>` : ''}
        ${incident.severity ? `<p><strong>Farenivå:</strong> ${config.name}</p>` : ''}
      </div>
    `;
  }

  /**
   * Create a circle for an incident visualization
   * @param {Object} incident - Incident data
   * @param {Object} circleConfig - Circle configuration
   * @param {number} baseRadius - Base radius in meters
   * @param {L.Marker} centerMarker - Center marker for the popup
   * @returns {L.Circle} Configured circle
   */
  createIncidentCircle(incident, circleConfig, baseRadius, centerMarker) {
    const circle = L.circle([incident.latitude, incident.longitude], {
      radius: baseRadius * circleConfig.radiusMultiplier,
      color: circleConfig.color,
      fillColor: circleConfig.color,
      fillOpacity: circleConfig.fillOpacity,
      weight: circleConfig.strokeWidth,
      interactive: true
    });

    // Add click handler to open the popup on the center marker
    circle.on('click', () => {
      centerMarker.openPopup();
    });

    return circle;
  }

  /**
   * Create concentric circles for an incident based on severity
   * @param {Object} incident - Incident data
   * @returns {L.LayerGroup} - Layer group containing the circles
   */
  createIncidentCircles(incident, map) {
    if (!map) return null;

    const severity = incident.severity || 'GREEN';
    const baseRadius = incident.impactRadius * 1000; // Convert km to meters
    const config = this.getSeverityLevels()[severity] || this.getSeverityLevels().GREEN;

    // Create a layer group to hold our circles
    const layerGroup = L.layerGroup();

    // Create a marker at the center for the popup
    const popupContent = this.createIncidentPopupContent(incident, config);

    // Create a central marker that will hold the popup
    const centerMarker = L.marker([incident.latitude, incident.longitude], {
      opacity: 0,  // Make the marker invisible
      interactive: true // But keep it interactive
    }).bindPopup(popupContent);

    layerGroup.addLayer(centerMarker);

    // If visual configuration exists, create circles according to it
    if (config.visual && config.visual.circles) {
      // Sort circles by radius multiplier in descending order
      // to ensure proper z-index stacking (largest circles at the bottom)
      const sortedCircles = [...config.visual.circles]
        .sort((a, b) => b.radiusMultiplier - a.radiusMultiplier);

      // Create each circle according to the configuration
      sortedCircles.forEach(circleConfig => {
        const circle = this.createIncidentCircle(
          incident,
          circleConfig,
          baseRadius,
          centerMarker
        );

        layerGroup.addLayer(circle);
      });
    }

    return layerGroup;
  }
}

export default new IncidentConfigService();
