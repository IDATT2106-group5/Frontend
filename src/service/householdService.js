import BaseService from '@/service/baseService';

class HouseholdService extends BaseService {
  constructor() {
    super('/household');
  }

  // Get household details by using the userId
  async getHouseholdDetailsByUserId(userId) {
    if (!userId) {
      throw new Error('[ERROR] userId is undefined or null when calling getHouseholdDetailsByUserId');
    }
    try {
      console.log('[POST] details with userId:', userId);
      const response = await this.post('details', { userId });
      console.log('[RESPONSE] getHouseholdDetailsByUserId:', response);
      return response;
    } catch (error) {
      // Suppress expected 400 error logging
      if (error.response?.status !== 400) {
        console.error("Error fetching household details by user ID:", error);
      }
      throw error;
    }
  }
  

  // Add a member to the household
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

  // Update household details
  async updateHousehold(data) {
    try {
      console.log('[POST] /edit household:', data);
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
  
  // Update a unregistered member
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
  
      console.log('[POST] edit-unregistered-member → Sending payload:', payload);
  
      return this.post(`edit-unregistered-member`, payload);
    } catch (error) {
      console.error("Error updating unregistered member:", error);
      throw error;
    }
  }
  // Remove a member from the household
  async removeRegisteredMember(userId, householdId) {
    try {
      console.log('[REMOVE REGISTERED] userId:', userId, 'householdId:', householdId);
      return this.post(`remove-user`, {
        userId,
        householdId
      });
    } catch (error) {
      console.error("Error removing registered member:", error);
      throw error;
    }
  }

  // Remove an unregistered user 
  async removeUnregisteredMember(memberId) {
    try {
      console.log('[REMOVE UNREGISTERED] ID:', memberId);
      return this.post(`delete-unregistered-member`, { memberId });
    } catch (error) {
      console.error("Error removing unregistered member:", error);
      throw error;
    }
  }

  // Invite a member by email
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

  // Create a new household
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

  // Method to delete a household
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

  async transferOwnership(householdId, userId) {
    try {
      console.log('[POST] change-owner → Transferring ownership to userId:', userId, 'for householdId:', householdId);
      return this.post('change-owner', {
        householdId: householdId,
        userId: userId
      });
    } catch (error) {
      console.error("Error transferring ownership:", error);
      throw error;
    }
  }

  // Leave the household
  async leaveHousehold() {
    try {
      return this.post('leave');
    } catch (error) {
      console.error("Error leaving household:", error);
      throw error;
    }
  }
  
}

export default new HouseholdService();