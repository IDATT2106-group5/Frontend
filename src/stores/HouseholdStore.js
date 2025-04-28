import { defineStore } from 'pinia';
import HouseholdService from '@/service/householdService';

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
        const household = await HouseholdService.getCurrentHousehold();
        if (household) {
          this.currentHousehold = household;
          this.hasHousehold = true;
          return true;
        } else {
          this.hasHousehold = false;
          return false;
        }
      } catch (err) {
        this.error = err.message || 'Kunne ikke finne husholdning';
        this.hasHousehold = false;
        return false;
      } finally {
        this.isLoading = false;
      }
    },

    async fetchMembers() {
      try {
        if (!this.currentHousehold || !this.currentHousehold.id) {
          const hasHousehold = await this.checkCurrentHousehold();
          if (!hasHousehold) {
            this.error = 'Ingen aktiv husholdning funnet';
            return;
          }
        }

        this.isLoading = true;
        const members = await HouseholdService.getHouseholdMembers(this.currentHousehold.id);
        
        this.members.registered = members.filter(member => member.isRegistered);
        this.members.unregistered = members.filter(member => !member.isRegistered);
      } catch (err) {
        this.error = err.message || 'Kunne ikke hente medlemmer';
      } finally {
        this.isLoading = false;
      }
    },

    async addMember(newMember) {
      if (!this.currentHousehold?.id) {
        await this.checkCurrentHousehold();
        if (!this.hasHousehold) {
          throw new Error('Ingen aktiv husholdning');
        }
      }

      try {
        this.isLoading = true;
        const addedMember = await HouseholdService.addMember(
          this.currentHousehold.id, 
          newMember
        );
        
        if (addedMember.isRegistered) {
          this.members.registered.push(addedMember);
        } else {
          this.members.unregistered.push(addedMember);
        }
        
        return addedMember;
      } catch (err) {
        this.error = err.message || 'Kunne ikke legge til medlem';
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
          data
        );
        
        const targetArray = isRegistered ? 'registered' : 'unregistered';
        const index = this.members[targetArray].findIndex(member => member.id === memberId);
        
        if (index !== -1) {
          this.members[targetArray][index] = updatedMember;
        }
        
        return updatedMember;
      } catch (err) {
        this.error = err.message || 'Kunne ikke oppdatere medlem';
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
        await HouseholdService.removeMember(this.currentHousehold.id, memberId);
        
        const targetArray = isRegistered ? 'registered' : 'unregistered';
        this.members[targetArray] = this.members[targetArray].filter(
          member => member.id !== memberId
        );
      } catch (err) {
        this.error = err.message || 'Kunne ikke fjerne medlem';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    async inviteMember(memberId) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }

      try {
        this.isLoading = true;
        await HouseholdService.inviteMember(this.currentHousehold.id, memberId);
      } catch (err) {
        this.error = err.message || 'Kunne ikke sende invitasjon';
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
        this.error = err.message || 'Kunne ikke opprette husholdning';
        throw err;
      } finally {
        this.isLoading = false;
      }
    }
  }
});