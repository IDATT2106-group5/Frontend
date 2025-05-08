import BaseService from '@/service/baseService';

/**
 * Service for managing membership invitations and join requests.
 * Handles sending, receiving, and responding to invitations and join requests.
 */
class RequestService extends BaseService {
  /**
   * Initializes the RequestService with the membership requests base path.
   */
  constructor() {
    super('/membership-requests');
  }
  /**
   * Sends an invitation to a user.
   *
   * @param {Object} invitationData - Data for the invitation (e.g., userId, householdId).
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
    async sendInvitation(invitationData) {
      try {
        return await this.post('send-invitation', invitationData);
      } catch (error) {
        console.error('[ERROR] Sending invitation:', error);
        throw error;
      }
    }
  
   /**
   * Fetches all invitations sent by a household.
   *
   * @param {string} householdId - ID of the household.
   * @returns {Promise<Array<Object>>} List of sent invitations.
   * @throws {Error} If the request fails.
   */
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

  /**
   * Fetches all join requests received by the household.
   *
   * @param {string} householdId - Household ID.
   * @returns {Promise<Array<Object>>} List of join requests.
   * @throws {Error} If the request fails.
   */
  async getReceivedJoinRequests(householdId) {
    try {
      
      const data = await this.post('join-requests/received', { householdId });
  
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

  /**
   * Fetches all invitations received by a user.
   *
   * @param {string} userId - User ID.
   * @returns {Promise<Array<Object>>} List of received invitations.
   * @throws {Error} If the request fails.
   */
    async getReceivedInvitationsByUser(userId) {
      try {

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

  /**
   * Sends a join request to a household.
   *
   * @param {Object} requestData - Join request data (e.g., userId, householdId).
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
    async sendJoinRequest(requestData) {
      try {
        return await this.post('send-join-request', requestData);
      } catch (error) {
        console.error('[ERROR] Sending join request:', error);
        throw error;
      }
    }

  /**
   * Accepts a join request by its ID.
   *
   * @param {string} requestId - The ID of the join request to accept.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async acceptJoinRequest(requestId) {
    try {
      return await this.post('accept-join-request', { requestId });
    } catch (error) {
      console.error('[ERROR] Accepting join request:', error);
      throw error;
    }
  }

  /**
   * Accepts a membership invitation by its ID.
   *
   * @param {string} requestId - The ID of the invitation to accept.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
    async acceptInvitationRequest(requestId) {
      try {
        return await this.post('accept-invitation-request', { requestId });
      } catch (error) {
        console.error('[ERROR] Accepting join request:', error);
        throw error;
      }
    }
  
  /**
   * Declines a join request by its ID.
   *
   * @param {string} requestId - The ID of the join request to decline.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
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