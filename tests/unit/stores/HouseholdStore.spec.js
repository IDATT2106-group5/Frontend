import { setActivePinia, createPinia } from 'pinia';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useHouseholdStore } from '@/stores/HouseholdStore';
import HouseholdService from '@/service/householdService';
import RequestService from '@/service/requestService';
import { useUserStore } from '@/stores/UserStore';


vi.mock('@/service/householdService', () => ({
    default: {
      getHouseholdDetailsByUserId: vi.fn(),
      updateHousehold: vi.fn(),
      addMember: vi.fn(),
      updateUnregisteredMember: vi.fn(),
      removeRegisteredMember: vi.fn(),
      removeUnregisteredMember: vi.fn(),
      cancelInvitation: vi.fn(),
      addUserToHousehold: vi.fn(),
      transferOwnership: vi.fn(),
      createHousehold: vi.fn(),
      deleteHousehold: vi.fn(),
      leaveHousehold: vi.fn(),
      searchHouseholdById: vi.fn(),
    }
  }));
  
  vi.mock('@/service/requestService', () => ({
    default: {
      sendInvitation: vi.fn(),
      getSentInvitationsByHousehold: vi.fn(),
      getReceivedJoinRequests: vi.fn(),
      getReceivedInvitationsByUser: vi.fn(),
      acceptJoinRequest: vi.fn(),
      acceptInvitationRequest: vi.fn(),
      declineJoinRequest: vi.fn(),
      sendJoinRequest: vi.fn()
    }
  }));

  vi.mock('@/stores/UserStore', () => ({
    useUserStore: vi.fn(() => ({
      user: { id: 'user1', email: 'test@example.com' }
    }))
  }));


describe('HouseholdStore', () => {
  let store;

  beforeEach(() => {
    setActivePinia(createPinia());
    store = useHouseholdStore();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default state', () => {
    expect(store.currentHousehold).toBe(null);
    expect(store.members.registered).toEqual([]);
    expect(store.members.unregistered).toEqual([]);
    expect(store.sentInvitations).toEqual([]);
    expect(store.error).toBe(null);
    expect(store.isLoading).toBe(false);
    expect(store.hasHousehold).toBe(false);
  });

  it('checkCurrentHousehold sets household and members', async () => {
    HouseholdService.getHouseholdDetailsByUserId.mockResolvedValue({
      household: { id: 'h1', owner: { id: 'user1' } },
      users: [{ id: 'user2', fullName: 'Test User', email: 'test@example.com' }],
      unregisteredMembers: [{ id: 'm1', fullName: 'Guest' }]
    });

    const result = await store.checkCurrentHousehold();
    expect(result).toBe(true);
    expect(store.currentHousehold.id).toBe('h1');
    expect(store.members.registered.length).toBe(1);
    expect(store.members.unregistered.length).toBe(1);
  });

  it('updateHousehold updates current household name/address', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1', name: 'Old', address: 'Old Address' };
    await store.updateHousehold({ id: 'h1', name: 'New', address: 'New Address' });
    expect(HouseholdService.updateHousehold).toHaveBeenCalled();
    expect(store.currentHousehold.name).toBe('New');
  });

  it('addMember adds registered member', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    HouseholdService.addMember.mockResolvedValue({
      id: 'u2', fullName: 'John Doe', isRegistered: true
    });
    await store.addMember({ fullName: 'John Doe', email: 'john@example.com' });
    expect(store.members.registered).toHaveLength(1);
  });

  it('updateUnregisteredMember updates name', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    store.members.unregistered = [{ id: 'm1', fullName: 'Old', isRegistered: false }];
    await store.updateUnregisteredMember('m1', { name: 'New Name' }, false);
    expect(store.members.unregistered[0].fullName).toBe('New Name');
  });

  it('removeMember removes unregistered member', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    const member = { id: 'm1', fullName: 'Old', isRegistered: false };
    store.members.unregistered = [member];
  
    await store.removeMember(member, false);
  
    expect(store.members.unregistered).toHaveLength(0);
  });

  it('inviteMember sends invitation and fetches invitations', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    +  RequestService.sendInvitation.mockResolvedValue(true);
    RequestService.getSentInvitationsByHousehold.mockResolvedValue([]);
    const result = await store.inviteMember('invite@example.com');
    expect(result).toBe(true);
    expect(RequestService.sendInvitation).toHaveBeenCalled();
  });

  it('acceptInvitation updates status and refreshes household', async () => {
    store.receivedInvitations = [{ id: 'inv1', status: 'PENDING' }];
    RequestService.acceptInvitationRequest.mockResolvedValue({});
    HouseholdService.getHouseholdDetailsByUserId.mockResolvedValue({
      household: { id: 'h1', owner: { id: 'user1' } },
      users: [],
      unregisteredMembers: []
    });
    await store.acceptInvitation('inv1');
    expect(store.receivedInvitations[0].status).toBe('ACCEPTED');
  });

  it('declineInvitation updates status', async () => {
    store.receivedInvitations = [{ id: 'inv1', status: 'PENDING' }];
    RequestService.declineJoinRequest.mockResolvedValue({});
    await store.declineInvitation('inv1');
    expect(store.receivedInvitations[0].status).toBe('REJECTED');
  });

  it('sendJoinRequest pushes to sentJoinRequests', async () => {
    store.currentHousehold = { id: 'other', ownerId: 'user2' };
    RequestService.sendJoinRequest.mockResolvedValue({});
    await store.sendJoinRequest('target-household');
    expect(store.sentJoinRequests).toHaveLength(1);
  });

  it('transferOwnership calls HouseholdService and refreshes', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    HouseholdService.transferOwnership.mockResolvedValue({});
    HouseholdService.getHouseholdDetailsByUserId.mockResolvedValue({
      household: { id: 'h1', owner: { id: 'user1' } },
      users: [],
      unregisteredMembers: []
    });
    await store.transferOwnership('user2');
    expect(HouseholdService.transferOwnership).toHaveBeenCalled();
  });

  it('createHousehold sets current household', async () => {
    HouseholdService.createHousehold.mockResolvedValue({ id: 'h1', name: 'Home', address: '123 St' });
    const result = await store.createHousehold({ name: 'Home', address: '123 St', ownerId: 'user1' });
    expect(result.id).toBe('h1');
    expect(store.currentHousehold.name).toBe('Home');
  });

  it('deleteHousehold clears store state', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    HouseholdService.deleteHousehold.mockResolvedValue({});
    await store.deleteHousehold();
    expect(store.currentHousehold).toBe(null);
    expect(store.hasHousehold).toBe(false);
  });

  it('leaveHousehold clears store state', async () => {
    store.currentHousehold = { id: 'h1' };
    HouseholdService.leaveHousehold.mockResolvedValue({});
    await store.leaveHousehold();
    expect(store.currentHousehold).toBe(null);
    expect(store.hasHousehold).toBe(false);
  });

  it('searchHouseholdById returns found household', async () => {
    HouseholdService.searchHouseholdById.mockResolvedValue({ id: 1, name: 'Found House' });
    const result = await store.searchHouseholdById(1);
    expect(result.name).toBe('Found House');
  });
  it('loadHouseholdData calls check and fetches data', async () => {
    HouseholdService.getHouseholdDetailsByUserId.mockResolvedValue({
      household: { id: 'h1', owner: { id: 'user1' } },
      users: [],
      unregisteredMembers: []
    });
    RequestService.getSentInvitationsByHousehold.mockResolvedValue([]);
    RequestService.getReceivedJoinRequests.mockResolvedValue([]);

    const result = await store.loadHouseholdData();
    expect(result).toBe(true);
    expect(store.hasHousehold).toBe(true);
  });

  it('cancelInvitation calls service and refreshes invitations', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    HouseholdService.cancelInvitation.mockResolvedValue({});
    RequestService.getSentInvitationsByHousehold.mockResolvedValue([]);
    await store.cancelInvitation('test@example.com');
    expect(HouseholdService.cancelInvitation).toHaveBeenCalledWith('test@example.com');
  });

  it('fetchJoinRequests updates ownershipRequests', async () => {
    store.currentHousehold = { id: 'h1' };
    RequestService.getReceivedJoinRequests.mockResolvedValue([
      { id: 'r1', sender: { id: 'u1', fullName: 'Jon', email: 'a@b.com' }, status: 'PENDING' }
    ]);
    await store.fetchJoinRequests();
    expect(store.ownershipRequests[0].id).toBe('r1');
  });

  it('fetchReceivedInvitations maps response', async () => {
    RequestService.getReceivedInvitationsByUser.mockResolvedValue([
      { id: 'inv1', householdId: 'h1', householdName: 'My House', status: 'PENDING' }
    ]);
    await store.fetchReceivedInvitations();
    expect(store.receivedInvitations[0].householdName).toBe('My House');
  });

  it('addUserToHousehold calls service and refreshes', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    HouseholdService.addUserToHousehold.mockResolvedValue({});
    HouseholdService.getHouseholdDetailsByUserId.mockResolvedValue({
      household: { id: 'h1', owner: { id: 'user1' } },
      users: [],
      unregisteredMembers: []
    });
    await store.addUserToHousehold('user2');
    expect(HouseholdService.addUserToHousehold).toHaveBeenCalled();
  });

  it('updateJoinRequestStatus accepts a request', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    store.ownershipRequests = [{ id: 'r1', status: 'PENDING' }];
    RequestService.acceptJoinRequest.mockResolvedValue({});
    await store.updateJoinRequestStatus('r1', 'ACCEPTED');
    expect(store.ownershipRequests[0].status).toBe('ACCEPTED');
  });

  it('updateJoinRequestStatus rejects a request', async () => {
    store.currentHousehold = { id: 'h1', ownerId: 'user1' };
    store.ownershipRequests = [{ id: 'r1', status: 'PENDING' }];
    RequestService.declineJoinRequest.mockResolvedValue({});
    await store.updateJoinRequestStatus('r1', 'REJECTED');
    expect(store.ownershipRequests[0].status).toBe('REJECTED');
  });
});

