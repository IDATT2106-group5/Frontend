import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import { createTestingPinia } from '@pinia/testing'
import HomeView from '@/views/mainViews/HomeView.vue'

// Mock all required stores
vi.mock('@/stores/DateStore', () => ({
  useDateStore: () => ({
    currentDateTime: new Date().toISOString(),
    formattedDateTime: '05. mai 2025 14:00',
    startClock: vi.fn(),
    stopClock: vi.fn(),
  }),
}))

vi.mock('@/stores/UserStore', () => ({
  useUserStore: () => ({
    user: null,
    autoLogin: vi.fn(),
    fetchUser: vi.fn().mockResolvedValue(),
  }),
}))

vi.mock('@/stores/NewsStore', () => ({
  useNewsStore: () => ({
    newsItems: [],
    fetchNews: vi.fn().mockResolvedValue(),
  }),
}))

vi.mock('@/stores/HouseholdStore', () => ({
  useHouseholdStore: () => ({
    currentHousehold: vi.fn().mockResolvedValue(),
  }),
}))

vi.mock('@/stores/admin/incidentAdminStore.js', () => ({
  useIncidentAdminStore: () => ({
    incidents: [],
    fetchIncidents: vi.fn().mockResolvedValue(),
  }),
}))

describe('HomeView.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(HomeView, {
      global: {
        stubs: {
          RouterLink: RouterLinkStub,
        },
        plugins: [
          createTestingPinia({
            createSpy: vi.fn,
          }),
        ],
      },
    })
  })

  it('contains a router-link to /map', () => {
    const link = wrapper.findAllComponents(RouterLinkStub).find(l => l.props().to === '/map')
    expect(link).toBeTruthy()
  })

  it('contains a router-link to /before', () => {
    const link = wrapper.findAllComponents(RouterLinkStub).find(l => l.props().to === '/before')
    expect(link).toBeTruthy()
  })

  it('contains a router-link to /under', () => {
    const link = wrapper.findAllComponents(RouterLinkStub).find(l => l.props().to === '/under')
    expect(link).toBeTruthy()
  })

  it('contains a router-link to /after', () => {
    const link = wrapper.findAllComponents(RouterLinkStub).find(l => l.props().to === '/after')
    expect(link).toBeTruthy()
  })
})
