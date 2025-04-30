import BaseService from '@/service/baseService';

class HouseholdService extends BaseService {
  constructor() {
    super('/household');
  }

  // Fetch household details using userId 
  async getHouseholdDetailsByUserId(userId) {
    if (!userId) {
      throw new Error('[ERROR] userId is undefined or null when calling getHouseholdDetailsByUserId');
    }
    try {
      console.log('[GET] details/', userId);
      const response = await this.get(`/details/${userId}`);
      console.log('[RESPONSE] getHouseholdDetailsByUserId:', response);
      return response;
    } catch (error) {
      console.error("Error fetching household details by user ID:", error);
      throw error;
    }
  }

  // Get all members of a household
  async getHouseholdMembers(householdId) {
    try {
      const response = await this.get(`/members?householdId=${householdId}`);
      
      const registeredMembers = response['registered members'] || [];
      const unregisteredMembers = response['unregistered members'] || [];
      
      const registered = registeredMembers.map(member => ({
        id: member.id,
        name: member.fullName,
        email: member.email,
        isRegistered: true
      }));

      const unregistered = unregisteredMembers.map(member => ({
        id: member.id,
        name: member.fullName,
        isRegistered: false
      }));

      return [...registered, ...unregistered];
    } catch (error) {
      console.error("Error fetching household members:", error);
      throw error;
    }
  }

  // Add a member to the household
  async addMember(householdId, data) {
    try {
      if (data.email) {
        await this.post('/add-user', {
          email: data.email,
          householdId: householdId
        });
        return {
          id: Date.now(),
          name: data.name,
          email: data.email,
          isRegistered: true
        };
      } else {
        await this.post('/add-unregistered-member', {
          fullName: data.name,
          householdId: householdId
        });
        return {
          id: Date.now(),
          name: data.name,
          isRegistered: false
        };
      }
    } catch (error) {
      console.error("Error adding member:", error);
      throw error;
    }
  }

  // Update a member's information
  async updateMember(householdId, memberId, data) {
    try {
      if (data.isRegistered) {
        throw new Error("Cannot update registered members.");
      }
      return this.post(`/edit-unregistered-member`, {
        id: memberId,
        fullName: data.name,
        householdId: householdId
      });
    } catch (error) {
      console.error("Error updating unregistered member:", error);
      throw error;
    }
  }

  // Remove a member from the household
  async removeMember(householdId, memberId, isRegistered) {
    try {
      if (isRegistered) {
        return this.post(`/remove-user`, memberId);
      } else {
        return this.deleteReq(`/delete-unregistered-member`, {
          fullName: memberId,
          householdId: householdId
        });
      }
    } catch (error) {
      console.error("Error removing member:", error);
      throw error;
    }
  }

  // Invite a member by email
  async inviteMember(householdId, email) {
    try {
      return this.post(`/invite-user`, {
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
      const response = await this.post('/create', {
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
      return this.post(`/remove-user`, email);
    } catch (error) {
      console.error("Error leaving household:", error);
      throw error;
    }
  }

  // Support DELETE with body
  async deleteReq(path = '', data) {
    try {
      const url = this.buildUrl(path);
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