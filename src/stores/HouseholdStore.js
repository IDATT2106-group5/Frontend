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

    async updateMember(memberId, data, isRegistered) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }

      try {
        this.isLoading = true;
        const updatedMember = await HouseholdService.updateMember(
          this.currentHousehold.id,
          memberId,
          { ...data, isRegistered }
        );

        const targetArray = isRegistered ? 'registered' : 'unregistered';
        const index = this.members[targetArray].findIndex(member => member.id === memberId);

        if (index !== -1) {
          this.members[targetArray][index] = updatedMember;
        }

        return updatedMember;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke oppdatere medlem';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async removeMember(memberId, isRegistered) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }

      try {
        this.isLoading = true;
        await HouseholdService.removeMember(this.currentHousehold.id, memberId, isRegistered);

        const targetArray = isRegistered ? 'registered' : 'unregistered';
        this.members[targetArray] = this.members[targetArray].filter(
          member => member.id !== memberId
        );
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