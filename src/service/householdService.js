import BaseService from '@/service/baseService';

/**
 * Service class for managing household related API calls.
 * Handles member management, household creation, updates, deletions, and invitations.
 */
class HouseholdService extends BaseService {
  /**
   * Initializes the HouseholdService with the base API path.
   */
  constructor() {
    super('/household');
  }

  /**
   * Fetch household details by user ID.
   * Get household details by using the userId
   *
   * @param {string} userId - ID of the user.
   * @returns {Promise<Object>} Household data.
   * @throws {Error} If userId is missing or request fails.
   */  
  async getHouseholdDetailsByUserId(userId) {
    if (!userId) {
      throw new Error('[ERROR] userId is undefined or null when calling getHouseholdDetailsByUserId');
    }
    try {
 
      const response = await this.post('details', { userId });
    
      return response;
    } catch (error) {
      if (error.response?.status !== 400) {
        console.error("Error fetching household details by user ID:", error);
      }
      throw error;
    }
  }
  
  /**
   * Add a member (registered or unregistered) to the household.
   *
   * @param {string} householdId - Household ID.
   * @param {{ fullName: string, email?: string }} data - Member details.
   * @returns {Promise<Object>} Newly added member object.
   * @throws {Error} If the request fails.
   */
  async addMember(householdId, data) {
    try {
      if (data.email) {
        await this.post('add-user', {
          email: data.email,
          householdId: householdId
        });
        return {
          id: Date.now(),
          fullName: data.fullName,
          email: data.email,
          isRegistered: true
        };
      } else {
        await this.post('add-unregistered-member', {
          fullName: data.fullName,
          householdId: householdId
        });
        return {
          id: Date.now(),
          fullName: data.fullName,
          isRegistered: false
        };
      }
    } catch (error) {
      console.error("Error adding member:", error);
      throw error;
    }
  }

  /**
   * Add a registered user to the household.
   *
   * @param {string} userId - User ID.
   * @param {string} householdId - Household ID.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async addUserToHousehold(userId, householdId) {
    try {
      return await this.post('add-user', {
        userId,
        householdId
      });
    } catch (error) {
      console.error("Error adding user to household:", error);
      throw error;
    }
  }
  /**
   * Update household details (name, address).
   *
   * @param {{ householdId: string, name: string, address: string }} data - Updated household info.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async updateHousehold(data) {
    try {
   
      return this.post('edit', {
        householdId: data.householdId,
        name: data.name,
        address: data.address
      });
    } catch (error) {
      console.error("Error updating household:", error);
      throw error;
    }
  }
  /**
   * Update an unregistered member's name.
   *
   * @param {string} householdId - Household ID.
   * @param {string} memberId - Member ID.
   * @param {{ name: string, isRegistered: boolean }} data - Updated member data.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If trying to update a registered member or request fails.
   */
  async updateUnregisteredMember(householdId, memberId, data) {
    try {
      if (data.isRegistered) {
        throw new Error("Cannot update registered members.");
      }
  
      const payload = {
        memberId,
        newFullName: data.name,
        householdId 
      };
  

  
      return this.post(`edit-unregistered-member`, payload);
    } catch (error) {
      console.error("Error updating unregistered member:", error);
      throw error;
    }
  }
  /**
   * Remove a registered user from the household.
   *
   * @param {string} userId - User ID.
   * @param {string} householdId - Household ID.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async removeRegisteredMember(userId, householdId) {
    try {
 
      return this.post(`remove-user`, {
        userId,
        householdId
      });
    } catch (error) {
      console.error("Error removing registered member:", error);
      throw error;
    }
  }
  /**
   * Remove an unregistered member from the household.
   *
   * @param {string} memberId - Member ID.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async removeUnregisteredMember(memberId) {
    try {
   
      return this.post(`delete-unregistered-member`, { memberId });
    } catch (error) {
      console.error("Error removing unregistered member:", error);
      throw error;
    }
  }
  /**
   * Invite a member by email to join the household.
   *
   * @param {string} householdId - Household ID.
   * @param {string} email - Email address to invite.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async inviteMember(householdId, email) {
    try {
      return this.post(`invite-user`, {
        email: email,
        householdId: householdId
      });
    } catch (error) {
      console.error("Error inviting member:", error);
      throw error;
    }
  }
  /**
   * Create a new household.
   *
   * @param {{ name: string, address: string, ownerId: string }} data - New household data.
   * @returns {Promise<Object>} Created household with ID.
   * @throws {Error} If the request fails.
   */
  async createHousehold(data) {
    try {
      const response = await this.post('create', {
        name: data.name,
        address: data.address,
        ownerId: data.ownerId
      });
      
      return {
        id: response.id || Math.floor(Math.random() * 1000),
        name: data.name,
        address: data.address
      };
    } catch (error) {
      console.error("Error creating household:", error);
      throw error;
    }
  }
  /**
   * Delete a household by ID and owner.
   *
   * @param {string} householdId - ID of the household to delete.
   * @param {string} ownerId - ID of the owner requesting deletion.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async deleteHousehold(householdId, ownerId) {
    try {
      return await this.post('delete', {
        householdId,
        ownerId
      });
    } catch (error) {
      console.error('Error deleting household:', error);
      throw error;
    }
  }
  /**
   * Transfer household ownership to another user.
   *
   * @param {string} householdId - ID of the household.
   * @param {string} userId - ID of the new owner.
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async transferOwnership(householdId, userId) {
    try {
     
      return this.post('change-owner', {
        householdId: householdId,
        userId: userId
      });
    } catch (error) {
      console.error("Error transferring ownership:", error);
      throw error;
    }
  }
  /**
   * Leave the currently joined household.
   *
   * @returns {Promise<Object>} API response.
   * @throws {Error} If the request fails.
   */
  async leaveHousehold() {
    try {
      return this.post('leave');
    } catch (error) {
      console.error("Error leaving household:", error);
      throw error;
    }
  }
  /**
   * Search for a household by its ID.
   *
   * @param {{ householdId: string|number }} data - Data containing the household ID.
   * @returns {Promise<Object>} API response with household info.
   * @throws {Error} If the household ID is invalid or request fails.
   */
  async searchHouseholdById(data) {
    try {
      const householdId = Number(data.householdId)
  
      if (isNaN(householdId) || householdId <= 0) {
        throw new Error('Ugyldig husstands-ID')
      }
  
      const response = await this.post('search', { householdId })
  
      // If backend returns null or empty object when not found
      if (!response || !response.id) {
        return null
      }
  
      return response
    } catch (error) {
      // ✅ If it's a 404 response, just return null
      if (error.response && error.response.status === 404) {
        return null
      }
  
      console.error('Error searching for household:', error)
      return null // ✅ Don't throw here
    }
  }
  
}

export default new HouseholdService();