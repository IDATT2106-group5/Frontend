import { defineStore } from 'pinia';
import HouseholdService from '@/service/householdService.js';

export const useHouseholdStore = defineStore('household', {
  state: () => ({
    members: [],
    error: null,
    isLoading: false,
  }),
  actions: {
    async fetchMembers() {
      try {
        this.isLoading = true;
        this.members = (await HouseholdService.getMembers()).data;
      } catch (err) {
        this.error = err.message || 'Kunne ikke hente medlemmer';
      } finally {
        this.isLoading = false;
      }
    },
    async addMember(newMember) {
      const added = await HouseholdService.addMember(newMember);
      this.members.push(added);
    },
    async removeMember(id) {
      await HouseholdService.removeMember(id);
      this.members = this.members.filter(m => m.id !== id);
    },
    async inviteMember(id) {
    await HouseholdService.inviteMember(id);
    }
  }
});
