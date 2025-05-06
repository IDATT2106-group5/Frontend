import BaseService from '@/service/baseService';

class RequestService extends BaseService {
  constructor() {
    super('/membership-requests');
  }

  //Method for sending an invitation to a user
    async sendInvitation(invitationData) {
      try {
        console.log('[SENDING INVITATION] To email:', invitationData.email, 'For household:', invitationData.householdId);
        return await this.post('send-invitation', invitationData);
      } catch (error) {
        console.error('[ERROR] Sending invitation:', error);
        throw error;
      }
    }
  
    //Method for getting all sent invitations by householdId
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
  

  //Method for getting all received join request to the household
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
  

    // Method for getting all received invitations for a user
    async getReceivedInvitationsByUser(userId) {
      try {
        console.log('[REQUEST] Getting received invitations for userId:', userId);
        const response = await this.post('invitations/received', { userId });

        if (Array.isArray(response)) {
          return response;
        }

        if (response && response.data) {
          return response.data;
        }

        console.warn('Could not find invitations array in response');
        return [];
      } catch (error) {
        console.error('[ERROR] Fetching received invitations:', error);
        throw error;
      }
    }

    // Method for sending a join request to a household
    async sendJoinRequest(requestData) {
      try {
        console.log('[SENDING JOIN REQUEST] UserId:', requestData.userId, 'To household:', requestData.householdId);
        return await this.post('send-join-request', requestData);
      } catch (error) {
        console.error('[ERROR] Sending join request:', error);
        throw error;
      }
    }

  //Method for accepting a join request
  async acceptJoinRequest(requestId) {
    try {
      return await this.post('accept', { requestId });
    } catch (error) {
      console.error('[ERROR] Accepting join request:', error);
      throw error;
    }
  }
  
  //Method for declining a join request
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