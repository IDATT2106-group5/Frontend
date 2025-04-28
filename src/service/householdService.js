import BaseService from '@/service/baseService';

const MOCK_MODE = true; 

class HouseholdService extends BaseService {
  constructor() {
    super('household');
  }
  getCurrentHousehold() {
    if (MOCK_MODE) {
      return Promise.resolve({
        id: 999, 
        name: 'Mocked Household',
      });
    }
    return this.get('../user/household');
  }
  getHouseholdMembers(householdId) {
    if (MOCK_MODE) {
      return Promise.resolve([
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', phone: '12345678', isRegistered: true },
        { id: 2, name: 'Bob Smith', email: '', phone: '', isRegistered: false },
      ]);
    }
    return this.get(`${householdId}/members`);
  }
  
  addMember(householdId, data) {
    return this.post(`${householdId}/members`, data);
  }

  updateMember(householdId, memberId, data) {
    return this.put(`${householdId}/members/${memberId}`, data);
  }

  removeMember(householdId, memberId) {
    return this.deleteItem(`${householdId}/members/${memberId}`);
  }

  inviteMember(householdId, memberId) {
    return this.post(`${householdId}/members/${memberId}/invite`);
  }

  createHousehold(data) {
    return this.post('', data);
  }
}

export default new HouseholdService();