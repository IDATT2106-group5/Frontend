/**
 * Service for getting user location with fallback mechanisms
 */
class GeolocationService {
  /**
   * Get user's current position with fallback to IP-based geolocation
   * @param {Object} options - Options for geolocation
   * @returns {Promise<Array>} - [latitude, longitude] coordinates
   */
  async getUserLocation(options = {}) {
    try {
      // Try browser geolocation first
      const position = await this.getBrowserLocation(options);
      return [position.coords.latitude, position.coords.longitude];
    } catch (error) {
      console.warn("Browser geolocation failed, falling back to IP geolocation:", error);

      // Fallback to IP-based geolocation
      try {
        return await this.getIPBasedLocation();
      } catch (ipError) {
        console.error("IP geolocation also failed:", ipError);
        throw new Error("Could not determine user location: " + error.message);
      }
    }
  }

  /**
   * Get user location using browser's geolocation API
   * @param {Object} options - Geolocation options
   * @returns {Promise<GeolocationPosition>} - Browser geolocation position
   */
  getBrowserLocation(options = {}) {
    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    const mergedOptions = { ...defaultOptions, ...options };

    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, mergedOptions);
    });
  }

  /**
   * Get user location based on IP address
   * @returns {Promise<Array>} - [latitude, longitude] coordinates
   */
  async getIPBasedLocation() {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();

    if (data.latitude && data.longitude) {
      return [data.latitude, data.longitude];
    }

    throw new Error("Could not determine location from IP");
  }

  /**
   * Get a readable error message from geolocation errors
   * @param {GeolocationPositionError} error - The geolocation error
   * @returns {string} - Human-readable error message in Norwegian
   */
  getErrorMessage(error) {
    if (!error || !error.code) {
      return "Ukjent feil ved henting av posisjon.";
    }

    switch (error.code) {
      case error.PERMISSION_DENIED:
        return "Du må gi tillatelse til å dele din posisjon.";
      case error.POSITION_UNAVAILABLE:
        return "Posisjonen din er ikke tilgjengelig.";
      case error.TIMEOUT:
        return "Det tok for lang tid å hente posisjonen din.";
      default:
        return "Det oppstod en feil ved henting av posisjon.";
    }
  }
}

export default new GeolocationService();
