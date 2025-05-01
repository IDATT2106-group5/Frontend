import BaseService from '@/service/baseService';

class RequestService extends BaseService {
  constructor() {
    super('/membership-requests');
  }
  
  async getSentInvitations(userId) {
    try {
      const response = await this.post('/invitations/sent', { userId });
      
      // Add additional logging to see what the response actually contains
      console.log('[FULL RESPONSE]', response);
      
      // Depending on your API's response structure, you may need to extract data differently
      // If the response directly contains the array (without a data property):
      if (Array.isArray(response)) {
        return response;
      }
      
      // If it's in a data property:
      if (response && response.data) {
        return response.data;
      }
      
      // If you're not sure where it is, log the full response and return an empty array for safety
      console.warn('Could not find invitations array in response');
      return [];
    } catch (error) {
      console.error("Error fetching sent invitations:", error);
      throw error;
    }
  }
}

export default new RequestService();