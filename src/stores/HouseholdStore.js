import { defineStore } from 'pinia';
import HouseholdService from '@/service/householdService';
import { useUserStore } from '@/stores/UserStore';
import RequestService from '@/service/requestService';

/**
 * Pinia store for managing household-related data and actions.
 */
export const useHouseholdStore = defineStore('household', {
  /**
   * @returns {object} State object for the household store.
   */
  state: () => ({
    /** @type {object|null} */
    currentHousehold: null,
    
    /** @type {{ registered: Array<object>, unregistered: Array<object> }} */
    members: {
      registered: [],
      unregistered: []
    },
    /** @type {Array<object>} */
    ownershipRequests: [],

    /** @type {Array<object>} */
    sentInvitations: [],

    /** @type {Array<object>} */
    sentJoinRequests: [],

    /** @type {Array<object>} */
    receivedInvitations: [],

    /** @type {string|null} */
    error: null,

    /** @type {boolean} */
    isLoading: false,

    /** @type {boolean} */
    hasHousehold: false
  }),

  getters: {
    /**
     * @returns {Array<object>} All household members (registered + unregistered).
     */
    allMembers() {
      return [...this.members.registered, ...this.members.unregistered];
    },

    /**
     * @returns {number} Total count of all household members.
     */
    totalMemberCount() {
      return this.allMembers.length;
    },

    /**
     * @returns {boolean} True if current user is the household owner.
     */
    isCurrentUserOwner() {
      const userStore = useUserStore();
      return userStore.user?.id === this.currentHousehold?.ownerId;
    }
  },

  actions: {
    /**
     * Verifies if the current user is the household owner.
     * @private
     * @throws {Error} If current user is not the owner.
     * @returns {true}
     */
    _verifyOwnership() {
      if (!this.isCurrentUserOwner) {
        throw new Error('Kun eier av husstanden kan utføre denne handlingen');
      }
      return true;
    },

    /**
     * Checks if the current user belongs to a household.
     * Gets the information for that household.
     * @returns {Promise<boolean>} True if household is found, otherwise false.
     */
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

    /**
     * Fetches the current household details.
     * Updates the current household's name and address.
     * @param {object} householdData - Contains household id, name, and address.
     * @returns {Promise<boolean>} True if update was successful.
     */
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

    /**
     * Loads current household and related data.
     * @returns {Promise<boolean>} True if household data loaded.
     */
    async loadHouseholdData() {
      this.isLoading = true;
      this.error = null;
    
      try {
        const hasHousehold = await this.checkCurrentHousehold();
        this.hasHousehold = !!hasHousehold;
    
        if (hasHousehold) {
          await Promise.all([
            this.fetchSentInvitations(),
            this.fetchJoinRequests()
          ]);
        }
    
        return this.hasHousehold;
      } catch (e) {
        this.error = e.response?.data?.error || e.message || 'Kunne ikke laste husholdningsdata';
        this.hasHousehold = false;
        return false;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Adds a new unregistered member to the household.
     * @param {object} newMember - Member object with name and optional email.
     * @returns {Promise<object>} The added member object.
     */
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

    /**
     * Updates an unregistered member's name.
     * @param {string|number} memberId - ID of the member.
     * @param {object} data - New data with `name` field.
     * @param {boolean} isRegistered - Whether the member is registered.
     * @returns {Promise<object>} Updated member.
     */
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

    /**
     * Removes a member from the household.
     * @param {object|number} member - Member object or ID.
     * @param {boolean} isRegistered - Whether the member is registered.
     * @returns {Promise<void>}
     */
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

    /**
 * Sends an invitation email & refreshes list.
 * @param {string} email
 * @returns {Promise<object>} the raw service response
 * @throws {object} with `.response.data.message` on failure
 */
    async inviteMember(email) {
      try {
        this._verifyOwnership();
        const response = await RequestService.sendInvitation({
          email: email,
          householdId: this.currentHousehold.id
        });
    
        await this.fetchSentInvitations();
        return response;
      } catch (error) {
        let message = 'Ingen registrerte brukere eksisterer med denne e-posten';
        
        const backendData = error.response?.data || {};
        const backendMessage = backendData.message || backendData.error || error.message;
    
        if (backendMessage.includes('User with email not found')) {
          message = backendMessage.replace('User with email not found:', 'Fant ingen bruker med e-post:');
        }
    
        throw {
          response: {
            data: {
              message: message,
              details: backendMessage
            }
          }
        };
      }
    },
    
    /**
     * Cancels a previously sent invitation.
     * @param {string} email - Email of the invited user.
     * @returns {Promise<void>}
     */
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

     /**
     * Fetches all sent invitations from the household.
     * @returns {Promise<void>}
     */
    async fetchSentInvitations() {
      if (!this.currentHousehold?.id) {
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

    /**
     * Fetches all join requests received by the household.
     * @returns {Promise<void>}
     */
    async fetchJoinRequests() {
      if (!this.currentHousehold?.id) return;

      try {
        const requests = await RequestService.getReceivedJoinRequests(this.currentHousehold.id);
        this.ownershipRequests = Array.isArray(requests)
          ? requests.map(req => ({
              id: req.id,
              userId: req.sender?.id,
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
    
    /**
     * Fetches all received invitations for the user.
     * @returns {Promise<void>}
     */
    async fetchReceivedInvitations() {
      try {
        this.isLoading = true;
        const userStore = useUserStore();
    
        if (!userStore.user || !userStore.user.id) {
          throw new Error('Bruker ikke funnet');
        }
    
        const userId = userStore.user.id;
  
    
        const response = await RequestService.getReceivedInvitationsByUser(userId);
    
        
    
        this.receivedInvitations = Array.isArray(response)
          ? response.map(invite => {
              const mapped = {
                id: invite.id,
                householdId: invite.householdId || 'Ukjent',
                householdName: invite.householdName || 'Ukjent navn',
                status: invite.status || 'PENDING'
              };
          
              return mapped;
            })
          : [];
    
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke hente invitasjoner';
        this.receivedInvitations = [];
        console.error('[FETCH RECEIVED INVITES] Error:', this.error);
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Accepts a received invitation.
     * Updates the invitation status to 'ACCEPTED' and refreshes the current household data.
     * @param {string} invitationId - ID of the invitation.
     * @returns {Promise<boolean>} True if successful.
     * @throws {Error} If the request fails or the invitation cannot be processed.
     */
    async acceptInvitation(invitationId) {
      try {
        this.isLoading = true;
    
        await RequestService.acceptInvitationRequest(invitationId); 
    
        const invitation = this.receivedInvitations.find(inv => inv.id === invitationId);
        if (invitation) {
          invitation.status = 'ACCEPTED';
        }
        await this.checkCurrentHousehold();
    
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke akseptere invitasjon';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Declines a received invitation.
     * @param {string} invitationId - ID of the invitation.
     * @returns {Promise<boolean>} True if successful.
     */
    async declineInvitation(invitationId) {
      try {
        this.isLoading = true;
    
        await RequestService.declineJoinRequest(invitationId);
    
        const invitation = this.receivedInvitations.find(inv => inv.id === invitationId);
        if (invitation) {
          invitation.status = 'REJECTED';
        }
    
        return true;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke avslå invitasjon';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * Adds a user to the household.
     * @param {string} userId - ID of the user to add.
     * @returns {Promise<boolean>} True if successful.
     */
    async addUserToHousehold(userId) {
      if (!this.currentHousehold?.id) {
        throw new Error('Ingen aktiv husholdning');
      }

      try {
        this.isLoading = true;
        this._verifyOwnership();

        await HouseholdService.addUserToHousehold(userId, this.currentHousehold.id);
        await this.checkCurrentHousehold();

        return true;
      } catch (err) {
        this.error = err.response?.data?.error || err.message || 'Kunne ikke legge til bruker i husstand';
        throw err;
      } finally {
        this.isLoading = false;
      }
    },
    /**
     * Updates the status of a join request.
     * @param {string} requestId - ID of the join request.
     * @param {'ACCEPTED'|'REJECTED'} action - Action to perform.
     * @returns {Promise<void>}
     */
    async updateJoinRequestStatus(requestId, action) {
      this._verifyOwnership()
      this.isLoading = true
      try {
        if (action === 'ACCEPTED') {
          await RequestService.acceptJoinRequest(requestId)
          await this.checkCurrentHousehold()
        }
        else {
          await RequestService.declineJoinRequest(requestId)
        }
    
        const req = this.ownershipRequests.find(r => r.id === requestId)
        if (req) req.status = action
    
      } catch (err) {
        this.error = err.message || `Kunne ikke ${action==='ACCEPTED'?'godta':'avslå'} forespørsel`
        throw err
      } finally {
        this.isLoading = false
      }
    },
    
    /**
     * Transfers ownership of the household to another user.
     * @param {string} userId - ID of the new owner.
     * @returns {Promise<boolean>} True if successful.
     */
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

     /**
     * Creates a new household.
     * @param {object} data - New household data.
     * @returns {Promise<object>} The created household.
     */
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

    /**
     * Deletes the current household.
     * @returns {Promise<void>}
     */
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

    /**
     * Leaves the current household.
     * @returns {Promise<void>}
     */
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

    /**
     * Searches for a household by ID.
     * Validates the input, queries the backend, and stores the found household's ID and name.
     * @param {string|number} householdId - Household ID.
     * @returns {Promise<{ id: number, name: string } | null>} The household's ID and name if found, otherwise null.
     * @throws {Error} If the input is invalid or the search fails due to a backend error.
     */
    async searchHouseholdById(householdId) {
      this.isLoading = true;
      try {
        if (!householdId || typeof householdId !== 'string') {
          throw new Error('Ugyldig husstands-ID');
        }
        const household = await HouseholdService.searchHouseholdById({ householdId });
        // 3) Handle empty result
        if (!household || !household.id) {
          throw new Error('Ingen husstand funnet');
        }
    
        return { id: household.id, name: household.name };
    
      } catch (err) {
        const status = err.response?.status;
        if (status === 400 || status === 404) {
          throw new Error('Ingen husstand funnet');
        }
        throw err;
    
      } finally {
        this.isLoading = false;
      }
    },
    
    /**
     * Sends a join request to another household.
     * @param {string|number} householdId - Target household ID.
     * @returns {Promise<boolean>} True if request was sent.
     */
    async sendJoinRequest(householdId) {
      try {
        this.isLoading = true;
        const userStore = useUserStore();
    
        if (!userStore.user || !userStore.user.id) {
          throw new Error('Bruker må være logget inn');
        }
    
        if (this.currentHousehold?.ownerId === userStore.user.id) {
          throw new Error('…');
        }
    
        const request = {
          userId: userStore.user.id,
          householdId: householdId
        };
    
        await RequestService.sendJoinRequest(request);
    
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
