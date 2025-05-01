import BaseService from '@/service/baseService';

class RequestService extends BaseService {
  constructor() {
    super('/membership-requests');
  }

    async sendInvitation(invitationData) {
      try {
        console.log('[SENDING INVITATION] To email:', invitationData.email, 'For household:', invitationData.householdId);
        return await this.post('send-invitation', invitationData);
      } catch (error) {
        console.error('[ERROR] Sending invitation:', error);
        throw error;
      }
    }
  
    async getSentInvitationsByHousehold(householdId) {
      try {
        const response = await this.post('invitations/sent/by-household', {
          householdId
        });
    
        if (Array.isArray(response)) {
          return response;
        }
    
        if (response && response.data) {
          return response.data;
        }
    
        console.warn('Could not find invitations array in response');
        return [];
      } catch (error) {
        console.error("Error fetching invitations by household:", error);
        throw error;
      }
    }
  

  async getReceivedJoinRequests(householdId) {
    try {
      console.log('[REQUEST] Sending householdId to backend:', householdId);
  
      const data = await this.post('join-requests/received', { householdId });
  
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

  async acceptJoinRequest(requestId) {
    try {
      return await this.post('accept', { requestId });
    } catch (error) {
      console.error('[ERROR] Accepting join request:', error);
      throw error;
    }
  }
  
  
  async declineJoinRequest(requestId) {
    try {
      return await this.post('decline', { requestId });
    } catch (error) {
      console.error('[ERROR] Declining join request:', error);
      throw error;
    }
  }
}

export default new RequestService();