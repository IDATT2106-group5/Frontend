import BaseService from '@/service/baseService';

class HouseholdService extends BaseService {
  constructor() {
    super('/household');
  }

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
      console.error("Error fetching household details by user ID:", error);
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

  // Update a unregistered member
  async updateUnregisteredMember(householdId, memberId, data) {
    try {
      if (data.isRegistered) {
        throw new Error("Cannot update registered members.");
      }
  
      const payload = {
        memberId,
        newFullName: data.name,
        householdId // only include this if your backend needs it
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

  // Remove an unregistered user (expects memberId in DELETE path)
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

  // Leave the current household
  async leaveHousehold(email) {
    try {
      return this.post(`remove-user`, email);
    } catch (error) {
      console.error("Error leaving household:", error);
      throw error;
    }
  }

  // Support DELETE with body
  async deleteReq(path = '', data) {
    try {
      // FIX: Don't use this.buildUrl() which adds the base path again
      const url = path;
      const config = { data };
      const response = await this.deleteItem(url, config);
      return response;
    } catch (error) {
      console.error("Error in delete request:", error);
      throw error;
    }
  }
}

export default new HouseholdService();