import BaseService from '@/service/baseService';

class RequestService extends BaseService {
  constructor() {
    super('/membership-requests');
  }
  
  async getSentInvitations(userId) {
    try {
      const response = await this.post('/invitations/sent', { userId });
      
      console.log('[FULL RESPONSE]', response);
      
      if (Array.isArray(response)) {
        return response;
      }
      
      if (response && response.data) {
        return response.data;
      }

            console.warn('Could not find invitations array in response');
      return [];
    } catch (error) {
      console.error("Error fetching sent invitations:", error);
      throw error;
    }
  }

  async getReceivedJoinRequests(householdId) {
    try {
      console.log('[REQUEST] Sending householdId to backend:', householdId);
  
      const data = await this.post('/join-requests/received', { householdId });
  
      console.log('[RESPONSE] Received from backend:', data);
  
      return data;
    } catch (error) {
      console.error('[ERROR] Failed to fetch join requests:', error);
  
      if (error.response) {
        console.error('[ERROR RESPONSE DATA]', error.response.data);
        console.error('[ERROR RESPONSE STATUS]', error.response.status);
        console.error('[ERROR RESPONSE HEADERS]', error.response.headers);
      } else if (error.request) {
        console.error('[ERROR REQUEST]', error.request);
      } else {
        console.error('[ERROR MESSAGE]', error.message);
      }
  
      throw error;
    }
  }
  
}



export default new RequestService();