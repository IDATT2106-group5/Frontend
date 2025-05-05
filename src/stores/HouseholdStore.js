import { defineStore } from 'pinia';
import HouseholdService from '@/service/householdService';
import { useUserStore } from '@/stores/UserStore'; 
import RequestService from '@/service/requestService'; 

export const useHouseholdStore = defineStore('household', {
  state: () => ({
    currentHousehold: null,
    members: {
      registered: [],
      unregistered: []
    },
    ownershipRequests: [],      
    sentInvitations: [],  
    sentJoinRequests: [],
    error: null,
    isLoading: false,
    hasHousehold: false
  }),

  getters: {
    allMembers() {
      return [...this.members.registered, ...this.members.unregistered];
    },
    totalMemberCount() {
      return this.allMembers.length;
    },
    isCurrentUserOwner() {
      const userStore = useUserStore();
      return userStore.user?.id === this.currentHousehold?.ownerId;
    }
  },

  // Actions to manage household data
  actions: {
    _verifyOwnership() {
      if (!this.isCurrentUserOwner) {
        throw new Error('Kun eier av husstanden kan utføre denne handlingen');
      }
      return true;
    },

    // Method to check if the user has a household and get the information for that household
    async checkCurrentHousehold() {
      try {
        this.isLoading = true;
        const userStore = useUserStore();
        
        if (!userStore.user || !userStore.user.id) {
          this.hasHousehold = false;
          return false;
        }
        const response = await HouseholdService.getHouseholdDetailsByUserId(userStore.user.id);
        this.currentHousehold = {
          ...response.household,
          ownerId: response.household.owner.id 
        };
        this.members.registered = (response.users || []).map(user => ({
          id: user.id,
          fullName: user.fullName,
          tlf: user.tlf,         
          email: user.email,
          isRegistered: true
        }))       
    
        this.members.unregistered = (response.unregisteredMembers || []).map(member => ({
          id: member.id,
          fullName: member.fullName,      
          isRegistered: false
        }))
        this.hasHousehold = true;
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke finne husholdning';
        this.hasHousehold = false;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to fetch household details
    async updateHousehold(householdData) {
      this.isLoading = true;
      try {
        this._verifyOwnership();
        
        await HouseholdService.updateHousehold({
          householdId: householdData.id, 
          name: householdData.name,
          address: householdData.address
        });
        this.currentHousehold = {
          ...this.currentHousehold,
          name: householdData.name,
          address: householdData.address
        };
        return true;
      } catch (error) {
        console.error('Failed to update household:', error);
        this.error = error.response?.data?.message || 'Kunne ikke oppdatere husstand';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to add a new unregistered member to the household
    async addMember(newMember) {
      if (!this.currentHousehold?.id) {
        const hasHousehold = await this.checkCurrentHousehold();
        if (!hasHousehold) {
          throw new Error('Ingen aktiv husholdning');
        }
      }
      try {
        this.isLoading = true;
        this._verifyOwnership();
        
        const addedMember = await HouseholdService.addMember(
          this.currentHousehold.id, 
          {
            fullName: newMember.name || newMember.fullName,
            email: newMember.email
          }
        );
        
        if (addedMember.isRegistered) {
          this.members.registered.push({
            ...addedMember,
            fullName: addedMember.fullName || newMember.name || newMember.fullName
          });
        } else {
          this.members.unregistered.push({
            ...addedMember,
            fullName: addedMember.fullName || newMember.name || newMember.fullName
          });
        }
        return addedMember;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke legge til medlem';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to update an unregistered members name
    async updateUnregisteredMember(memberId, data, isRegistered) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }
      try {
        this.isLoading = true;
        this._verifyOwnership();
    
        await HouseholdService.updateUnregisteredMember(
          this.currentHousehold.id,
          memberId,
          data
        );
  
        const targetArray = isRegistered ? 'registered' : 'unregistered';
        const index = this.members[targetArray].findIndex(member => member.id === memberId);
    
        if (index !== -1) {
          this.members[targetArray][index].fullName = data.name;
        }
    
        return this.members[targetArray][index]; 
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke oppdatere medlem';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Method to remove a member from the household
    async removeMember(member, isRegistered) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }
    
      try {
        this.isLoading = true;
        this._verifyOwnership();
    
        const memberId = typeof member === 'number' ? member : member.id;
    
        if (isRegistered) {
          if (!memberId) {
            throw new Error('ID mangler for registrert medlem');
          }
    
          await HouseholdService.removeRegisteredMember(memberId, this.currentHousehold.id);
          this.members.registered = this.members.registered.filter(m => m.id !== memberId);
        } else {
          if (!memberId) {
            throw new Error('ID mangler for uregistrert medlem');
          }
    
          await HouseholdService.removeUnregisteredMember(memberId);
          this.members.unregistered = this.members.unregistered.filter(m => m.id !== memberId);
        }
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke fjerne medlem';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to send an invitation to a new member
    async inviteMember(email) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }

      try {
        this.isLoading = true;
        this._verifyOwnership();

        const request = {
          email: email,
          householdId: this.currentHousehold.id
        };

        await RequestService.sendInvitation(request);
        await this.fetchSentInvitations();

        return true;
      } catch (err) {
        if (err.response?.status === 400) {
          const errorMessage = err.response.data || 'Kunne ikke sende invitasjon';
          
          if (typeof errorMessage === 'string' && errorMessage.includes('User with email not found')) {
            this.error = 'Ingen registrert bruker med denne e-posten.';
          } else {
            this.error = errorMessage;
          }
        } else {
          this.error = err.message || 'Kunne ikke sende invitasjon';
        }
        throw this.error; 
      } finally {
        this.isLoading = false;
      }
    },
    
    // Method to cancel an invitation
    async cancelInvitation(email) {
      try {
        this.isLoading = true;
        this._verifyOwnership();
        
        await HouseholdService.cancelInvitation(email);
        await this.fetchSentInvitations(); 
      } catch (err) {
        this.error = err.response?.data?.error || err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to get all sent invitations from the household
    async fetchSentInvitations() {
      if (!this.currentHousehold?.id) {
        console.warn('[FETCH INVITATIONS] No active household');
        return;
      }
    
      try {
        const invites = await RequestService.getSentInvitationsByHousehold(this.currentHousehold.id);
    
        this.sentInvitations = Array.isArray(invites)
          ? invites.map(invite => {
              const mapped = {
                email: invite.recipient?.email || 'Ukjent',
                date: invite.sentAt?.split('T')[0] || 'Ukjent dato',
                status: invite.status
              };
        
              return mapped;
            })
          : [];      
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke hente invitasjoner';
        this.sentInvitations = [];
        console.error('[FETCH INVITATIONS] Error:', this.error);
        throw err;
      }
    },
    
    // Method to fetch all join requests received by the household
    async fetchJoinRequests() {
      if (!this.currentHousehold?.id) return;
    
      try {
        const requests = await RequestService.getReceivedJoinRequests(this.currentHousehold.id);
        this.ownershipRequests = Array.isArray(requests)
          ? requests.map(req => ({
              id: req.id,
              fullName: req.sender?.fullName || 'Ukjent',
              email: req.sender?.email || 'Ukjent',
              status: req.status || 'PENDING'
            }))
          : [];
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke hente forespørsler';
        this.ownershipRequests = [];
      }
    },

    // Method to update the status of a join request
    async updateJoinRequestStatus(requestId, action) {
      try {
        this.isLoading = true;
        this._verifyOwnership();
    
        if (action === 'ACCEPTED') {
          await RequestService.acceptJoinRequest(requestId);
        } else if (action === 'REJECTED') {
          await RequestService.declineJoinRequest(requestId);
        } else {
          throw new Error('Ugyldig handling for forespørsel');
        }
    
        const request = this.ownershipRequests.find(r => r.id === requestId);
        if (request) request.status = action;
      } catch (err) {
        const actionText = action === 'ACCEPTED' ? 'godta' : 'avslå';
        this.error = err.response?.data?.error || err.message || `Kunne ikke ${actionText} forespørsel`;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to transfer ownership of the household
    async transferOwnership(userId) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husstand funnet');
      }
      
      try {
        this.isLoading = true;
        this._verifyOwnership();
        
        await HouseholdService.transferOwnership(this.currentHousehold.id, userId);
        
        await this.checkCurrentHousehold(); 
        return true;
      } catch (error) {
        console.error("Error transferring ownership:", error);
        this.error = error.response?.data?.message || 'Kunne ikke overføre eierskap';
        throw error;
      } finally {
        this.isLoading = false;
      }
    },
    
    // Method to create a new household
    async createHousehold(data) {
      try {
        this.isLoading = true;
        const newHousehold = await HouseholdService.createHousehold(data);
        this.currentHousehold = newHousehold;
        this.hasHousehold = true;
        return newHousehold;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke opprette husholdning';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to delete the current household
    async deleteHousehold() {
      const userStore = useUserStore();
    
      if (!this.currentHousehold?.id || !userStore.user?.id) {
        throw new Error('Manglende husstand eller brukerinfo');
      }
    
      this._verifyOwnership();
    
      try {
        this.isLoading = true;
        await HouseholdService.deleteHousehold(this.currentHousehold.id, userStore.user.id);
        this.currentHousehold = null;
        this.hasHousehold = false;
        this.members = { registered: [], unregistered: [] };
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke slette husstand';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    // Method to leave the current household
    async leaveHousehold() {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning å forlate');
      }
  
      try {
        this.isLoading = true;
    
        await HouseholdService.leaveHousehold(); 

        this.currentHousehold = null;
        this.hasHousehold = false;
        this.members = { registered: [], unregistered: [] };
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke forlate husholdning';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async searchHouseholdById(householdId) {
      try {
        this.isLoading = true;
        if (!householdId || isNaN(Number(householdId))) {
          throw new Error('Ugyldig husstands-ID format');
        }
        
        const response = await HouseholdService.searchHouseholdById({ 
          householdId: Number(householdId) 
        });
        return response;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke søke etter husstand';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    //Send a join request to a household
    async sendJoinRequest(householdId) {
      try {
        this.isLoading = true;
        const userStore = useUserStore();
        
        if (!userStore.user || !userStore.user.id) {
          throw new Error('Bruker må være logget inn');
        }
        
        const request = {
          userId: userStore.user.id,
          householdId: householdId
        };
        
        await RequestService.sendJoinRequest(request);
        
        // Add to sent join requests tracking
        this.sentJoinRequests.push({
          householdId: householdId,
          date: new Date().toISOString().split('T')[0],
          status: 'PENDING'
        });
        
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke sende forespørsel om å bli med i husstand';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },    
    
  }
});