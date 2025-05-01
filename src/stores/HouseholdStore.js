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
    }
  },

  actions: {
    async checkCurrentHousehold() {
      try {
        this.isLoading = true;
        const userStore = useUserStore();
        
        if (!userStore.user || !userStore.user.id) {
          this.hasHousehold = false;
          return false;
        }
        const response = await HouseholdService.getHouseholdDetailsByUserId(userStore.user.id);
        console.log('[RESPONSE] getHouseholdDetailsByUserId:', response);
        this.currentHousehold = response.household;
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
        console.error("Household check failed:", err);
        this.error = err.response?.data?.error || err.message || 'Kunne ikke finne husholdning';
        this.hasHousehold = false;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async addMember(newMember) {
      if (!this.currentHousehold?.id) {
        const hasHousehold = await this.checkCurrentHousehold();
        if (!hasHousehold) {
          throw new Error('Ingen aktiv husholdning');
        }
      }
      try {
        this.isLoading = true;
        
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

    async updateUnregisteredMember(memberId, data, isRegistered) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }
      try {
        this.isLoading = true;
    
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
    
    async removeMember(member, isRegistered) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }
    
      try {
        this.isLoading = true;
    
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

    async inviteMember(email) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }
    
      try {
        this.isLoading = true;
    
        const userStore = useUserStore();
        const request = {
          userId: userStore.user?.id,
          householdId: this.currentHousehold.id,
          email: email
        };
    
        await RequestService.sendInvitation(request);
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke sende invitasjon';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    async cancelInvitation(email) {
      try {
        this.isLoading = true;
        await HouseholdService.cancelInvitation(email);
        this.sentInvitations = invites || [];  
          } catch (err) {
        this.error = err.response?.data?.error || err.message;
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchSentInvitations() {
      const userStore = useUserStore();
      if (!userStore.user?.id) return;
    
      try {
        const invites = await RequestService.getSentInvitations(userStore.user.id);
        this.sentInvitations = Array.isArray(invites)
          ? invites.map(invite => ({
              email: invite.sender?.email || 'Ukjent',
              date: invite.sentAt?.split('T')[0] || 'Ukjent dato',
              status: invite.status
            }))
          : [];
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke hente invitasjoner';
        this.sentInvitations = [];
        throw err;
      }
    },

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

    async updateJoinRequestStatus(requestId, action) {
      try {
        this.isLoading = true;
    
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

    async leaveHousehold() {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning å forlate');
      }

      try {
        this.isLoading = true;
        const userStore = useUserStore();
        await HouseholdService.leaveHousehold(userStore.user.email);

        this.currentHousehold = null;
        this.hasHousehold = false;
        this.members = { registered: [], unregistered: [] };
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke forlate husholdning';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});