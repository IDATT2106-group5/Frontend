import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, RouterLinkStub } from '@vue/test-utils'
import HomeView from '@/views/mainViews/HomeView.vue'

// Mock DateStore
vi.mock('@/stores/DateStore', () => ({
  useDateStore: () => ({
    formattedDateTime: '05. mai 2025 14:00',
    startClock: vi.fn(),
    stopClock: vi.fn(),
  }),
}))

// Mock UserStore
vi.mock('@/stores/UserStore', () => ({
  useUserStore: () => ({
    user: null,
    autoLogin: vi.fn(),
    fetchUser: vi.fn(),
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
