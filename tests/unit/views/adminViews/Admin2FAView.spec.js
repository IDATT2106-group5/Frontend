import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import Admin2FAView from '@/views/adminViews/Admin2FAView.vue'
import { createRouter, createWebHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

// Mock the user store
vi.mock('@/stores/UserStore', () => ({
  useUserStore: () => ({
    verify2FA: vi.fn(),
    resend2FACode: vi.fn(),
    error: null,
    isLoading: false
  })
}))

// Create a mock router
const createTestRouter = () =>
  createRouter({
    history: createWebHistory(),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } }
    ]
  })

describe('Admin2FAView.vue', () => {
  let router
  let wrapper
  let pinia
  let userStore

  beforeEach(() => {
    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)

    // Clear mock calls between tests
    vi.clearAllMocks()

    // Setup router
    router = createTestRouter()
    vi.spyOn(router, 'push')

    // Mount component with required props
    wrapper = mount(Admin2FAView, {
      props: {
        email: 'test@example.com'
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // Get userStore instance from component
    userStore = wrapper.vm.userStore
  })

  it('renders 2FA verification form with correct elements', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.findAll('input[type="text"]').length).toBe(6)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('To-faktor autentisering')
    expect(wrapper.text()).toContain('test@example.com')
  })

  it('displays entered code correctly', async () => {
    // Fill all six input fields
    for (let i = 0; i < 6; i++) {
      await wrapper.findAll('input')[i].setValue(i + 1)
    }

    // Check if the code ref array is updated correctly
    expect(wrapper.vm.code).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('submits form and redirects on successful verification', async () => {
    // Mock successful verification
    userStore.verify2FA.mockResolvedValueOnce(true)

    // Fill all code inputs
    for (let i = 0; i < 6; i++) {
      await wrapper.findAll('input')[i].setValue(i + 1)
    }

    // Submit form
    await wrapper.find('form').trigger('submit')

    // Verify API called with correct data
    expect(userStore.verify2FA).toHaveBeenCalledWith({
      email: 'test@example.com',
      otp: '123456'
    })

    // Check for redirection
    expect(router.push).toHaveBeenCalledWith('/')
  })

  it('calls resendCode when resend button is clicked', async () => {
    // Mock the resend2FACode function
    userStore.resend2FACode.mockResolvedValueOnce({})

    // Mock window.alert
    const alertSpy = vi.spyOn(window, 'alert').mockImplementation(() => {})

    // Find and click resend button
    const resendButton = wrapper.find('button.text-blue-600')
    await resendButton.trigger('click')

    // Verify resend function was called with correct email
    expect(userStore.resend2FACode).toHaveBeenCalledWith('test@example.com')
    expect(alertSpy).toHaveBeenCalledWith('En ny kode har blitt sendt til din e-post')

    // Restore the original alert implementation
    alertSpy.mockRestore()
  })
})
