import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AdminRegisterView from '@/views/adminViews/AdminRegisterView.vue'
import { createRouter, createMemoryHistory } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'

// Mock the user store
vi.mock('@/stores/UserStore', () => ({
  useUserStore: () => ({
    registerAdmin: vi.fn(),
    error: null,
    isLoading: false
  })
}))

// Mock hCaptcha
global.window.hcaptcha = {
  render: vi.fn(),
  reset: vi.fn()
}
global.window.hcaptchaCallback = vi.fn()
global.window.hcaptchaReset = vi.fn()

// Mock document.querySelector for hCaptcha
vi.spyOn(document, 'querySelector').mockImplementation(() => ({ dataset: {} }))

// Create a mock router
const createTestRouter = () =>
  createRouter({
    history: createMemoryHistory('/'),
    routes: [
      { path: '/', name: 'home', component: { template: '<div>Home</div>' } },
      { path: '/login', name: 'login', component: { template: '<div>Login</div>' } }
    ]
  })

describe('AdminRegisterView.vue', () => {
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
    vi.spyOn(router, 'replace')

    // Mount component with required props
    wrapper = mount(AdminRegisterView, {
      props: {
        email: 'admin@example.com',
        token: 'valid-token-123'
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

  it('renders registration form with correct elements', () => {
    // Check page title
    expect(wrapper.find('h1').text()).toContain('Opprett administratorkonto')

    // Check email field is pre-filled and readonly
    const emailInput = wrapper.find('input[type="email"]')
    expect(emailInput.exists()).toBe(true)
    expect(emailInput.element.value).toBe('admin@example.com')
    expect(emailInput.element.readOnly).toBe(true)

    // Check for password fields
    expect(wrapper.findAll('input[type="password"]').length).toBe(2)

    // Check for captcha element
    expect(wrapper.find('.h-captcha').exists()).toBe(true)

    // Check for submit button
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').text()).toContain('Opprett konto')
  })

  it('validates password requirements', async () => {
    // Enter a short password
    const passwordInput = wrapper.findAll('input[type="password"]')[0]
    await passwordInput.setValue('short')
    await passwordInput.trigger('blur')

    // Check for error message
    expect(wrapper.text()).toContain('Passordet må være minst 8 tegn')

    // Enter a valid password
    await passwordInput.setValue('validpassword123')
    await passwordInput.trigger('blur')

    // Error should be gone
    expect(wrapper.text()).not.toContain('Passordet må være minst 8 tegn')
  })

  it('validates password confirmation matches', async () => {
    // Enter different passwords
    const passwordInput = wrapper.findAll('input[type="password"]')[0]
    const confirmInput = wrapper.findAll('input[type="password"]')[1]

    await passwordInput.setValue('validpassword123')
    await confirmInput.setValue('differentpassword')
    await confirmInput.trigger('blur')

    // Check for mismatch error
    expect(wrapper.text()).toContain('Passordene må være like')

    // Fix the confirmation password
    await confirmInput.setValue('validpassword123')
    await confirmInput.trigger('blur')

    // Error should be gone
    expect(wrapper.text()).not.toContain('Passordene må være like')
  })

  it('toggles password visibility when eye icon is clicked', async () => {
    // Find the password field and visibility toggle
    const passwordInput = wrapper.findAll('input[type="password"]')[0]
    const toggleButton = wrapper.findAll('button')[0] // First toggle button

    // Initial state should be password hidden
    expect(passwordInput.attributes('type')).toBe('password')

    // Click to show password
    await toggleButton.trigger('click')
    expect(wrapper.findAll('input')[1].attributes('type')).toBe('text')

    // Click to hide password again
    await toggleButton.trigger('click')
    expect(wrapper.findAll('input')[1].attributes('type')).toBe('password')
  })

  it('submits form and redirects on successful registration', async () => {
    // Mock successful registration
    userStore.registerAdmin.mockResolvedValueOnce(true)

    // Fill form fields
    const passwordInput = wrapper.findAll('input[type="password"]')[0]
    const confirmInput = wrapper.findAll('input[type="password"]')[1]

    const validPassword = "Validpassword123#"

    await passwordInput.setValue(validPassword)
    await confirmInput.setValue(validPassword)

    // Mock captcha token
    wrapper.vm.formData.hCaptchaToken = 'captcha-token-123'

    // Submit form
    await wrapper.find('form').trigger('submit')

    await flushPromises()

    // Check if registerAdmin was called with correct data
    expect(userStore.registerAdmin).toHaveBeenCalledWith({
      token: 'valid-token-123',
      password: validPassword,
    })

    // Check for redirection to login page
    expect(router.push).toHaveBeenCalledWith('/login')
  })

  it('redirects to login when token or email is missing', async () => {
    // Re-mount with missing token
    wrapper = mount(AdminRegisterView, {
      props: {
        email: 'admin@example.com',
        tokenMissing: true
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // Wait for component to process props
    await wrapper.vm.$nextTick()

    // Should redirect to login
    expect(router.replace).toHaveBeenCalledWith('/login')

    // Clear mock calls
    router.push.mockClear()

    // Re-mount with missing email
    wrapper = mount(AdminRegisterView, {
      props: {
        token: 'valid-token-123',
        emailMissing: true
      },
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        }
      }
    })

    // Wait for component to process props
    await wrapper.vm.$nextTick()

    // Should redirect to login
    expect(router.replace).toHaveBeenCalledWith('/login')
  })
})
