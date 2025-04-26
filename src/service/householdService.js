import apiClient from './apiClient';

export default {
  getMembers() {
    return apiClient.get('/household/members');
  },
  addMember(data) {
    return apiClient.post('/household/members', data);
  },
  removeMember(id) {
    return apiClient.delete(`/household/members/${id}`);
  },
  inviteMember(id) {
    return apiClient.post(`/household/members/${id}/invite`);
  }
}
