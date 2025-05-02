import { defineStore } from 'pinia';
import HouseholdService from '@/service/householdService';
import { useUserStore } from '@/stores/UserStore'; 

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
        const addedMember = await HouseholdService.addMember(this.currentHousehold.id, newMember);
        
        if (addedMember.isRegistered) {
          this.members.registered.push(addedMember);
        } else {
          this.members.unregistered.push(addedMember);
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
    
        // Call backend
        await HouseholdService.updateUnregisteredMember(
          this.currentHousehold.id,
          memberId,
          data
        );
  
        // Update state locally so the UI reflects it immediately
        const targetArray = isRegistered ? 'registered' : 'unregistered';
        const index = this.members[targetArray].findIndex(member => member.id === memberId);
    
        if (index !== -1) {
          this.members[targetArray][index].fullName = data.name;
        }
    
        return this.members[targetArray][index]; // bonus: return updated member
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
    
        console.log('[REMOVE] member:', member); // Debug log
        console.log('[REMOVE] isRegistered:', isRegistered);
    
        // Handle if member is passed as just an ID number
        const memberId = typeof member === 'number' ? member : member.id;
        
        if (isRegistered) {
          // For registered members, we need the email
          let memberEmail;
          if (typeof member === 'object' && member.email) {
            memberEmail = member.email;
          } else {
            // Try to find the member in our registered members list
            const foundMember = this.members.registered.find(m => m.id === memberId);
            if (!foundMember || !foundMember.email) {
              throw new Error('E-post mangler for registrert medlem');
            }
            memberEmail = foundMember.email;
          }
          
          await HouseholdService.removeRegisteredMember(memberEmail);
          this.members.registered = this.members.registered.filter(m => m.id !== memberId);
        } else {
          // For unregistered members, we need the ID
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
        await HouseholdService.inviteMember(this.currentHousehold.id, email);
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
        this.sentInvitations = this.sentInvitations.filter(i => i.email !== email);
      } catch (err) {
        this.error = err.response?.data?.error || err.message;
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