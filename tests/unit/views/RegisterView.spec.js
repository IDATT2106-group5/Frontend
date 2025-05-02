import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import RegisterView from '@/views/mainViews/RegisterView.vue'
import {createRouter, createWebHistory} from 'vue-router'
import {createPinia, setActivePinia} from 'pinia'

// Mock the user store
vi.mock('@/stores/UserStore', () => ({
  useUserStore: () => ({
    register: vi.fn().mockResolvedValue(true),
    error: null
  })
}))

// Create a mock router
const createTestRouter = () =>
  createRouter({
    history: createWebHistory(),
    routes: [
      {path: '/', name: 'home', component: {template: '<div>Home</div>'}},
      {
        path: '/verify-email',
        name: 'VerifyEmail',
        component: {template: '<div>Verify Email</div>'}
      },
      {path: '/login', name: 'login', component: {template: '<div>Login</div>'}},
      {
        path: '/register-failed',
        name: 'RegisterFailed',
        component: {template: '<div>Register Failed</div>'}
      }
    ]
  })

// Mock vue-the-mask
vi.mock('vue-the-mask', () => ({
  mask: vi.fn()
}))

describe('RegisterView.vue', () => {
  let router
  let wrapper
  let pinia
  let userStore

  beforeEach(() => {
    // Mock hCaptcha
    global.window.hcaptcha = {
      render: vi.fn()
    }
    global.window.hcaptchaCallback = vi.fn()
    global.window.hcaptchaReset = vi.fn()

    document.body.innerHTML = '<div class="h-captcha"></div>'

    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)

    vi.clearAllMocks()

    // Setup router
    router = createTestRouter()
    vi.spyOn(router, 'push')

    // Mount component
    wrapper = mount(RegisterView, {
      global: {
        plugins: [router, pinia],
        stubs: {
          'router-link': true
        },
        mocks: {
          $route: {path: '/register'}
        },
        directives: {
          mask: vi.fn()
        }
      },
      attachTo: document.body
    })

    // Get userStore instance from component
    userStore = wrapper.vm.userStore
  })

  it('renders registration form', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#fullName').exists()).toBe(true)
    expect(wrapper.find('#password').exists()).toBe(true)
    expect(wrapper.find('#confirmPassword').exists()).toBe(true)
    expect(wrapper.find('#privacy').exists()).toBe(true)
  })

  it('submits registration data and redirects on success', async () => {
    // Mock successful registration
    userStore.register.mockResolvedValueOnce(true)

    // Fill form fields
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#fullName').setValue('Test User')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('#confirmPassword').setValue('password123')
    await wrapper.find('#privacy').setChecked(true)

    // Set hCaptcha token directly
    wrapper.vm.formData.hCaptchaToken = 'test-token'

    // Submit form
    await wrapper.find('form').trigger('submit')

    // Wait for validation and register call
    await vi.waitFor(() => {
      expect(userStore.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        tlf: '',
        hCaptchaToken: 'test-token'
      })
    })

    // Verify navigation
    expect(router.push).toHaveBeenCalledWith('/verify-email')
  })

  it('shows error when registration fails', async () => {
    // Set up the mock to fail with error
    userStore.register.mockRejectedValueOnce(new Error('Registration failed'))
    userStore.error = 'Registration failed'

    // Fill form fields
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#fullName').setValue('Test User')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('#confirmPassword').setValue('password123')
    await wrapper.find('#privacy').setChecked(true)

    // Set hCaptcha token directly
    wrapper.vm.formData.hCaptchaToken = 'test-token'

    // Submit form
    await wrapper.find('form').trigger('submit')

    // Wait for validation and register call
    await vi.waitFor(() => {
      expect(userStore.register).toHaveBeenCalledWith({
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
        tlf: '',
        hCaptchaToken: 'test-token'
      })
    })

    // Check that error status is set
    expect(wrapper.vm.status.error).toBe(true)
    expect(wrapper.vm.status.errorMessage).toBeTruthy()
  })
})
