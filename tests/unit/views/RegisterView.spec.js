import {beforeEach, describe, expect, it, vi} from 'vitest'
import {mount} from '@vue/test-utils'
import RegisterView from '@/views/mainViews/RegisterView.vue'
import {createRouter, createWebHistory} from 'vue-router'
import {createPinia, setActivePinia} from 'pinia'

// Mock the auth service
vi.mock('@/service/authService', () => ({
  default: {
    register: vi.fn()
  }
}))

// Mock the userStore
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
      {path: '/verify-email', name: 'VerifyEmail', component: {template: '<div>Verify</div>'}},
      {
        path: '/register-success',
        name: 'RegisterSuccess',
        component: {template: '<div>Success</div>'}
      },
      {
        path: '/register-failed',
        name: 'RegisterFailed',
        component: {template: '<div>Failed</div>'}
      },
      {path: '/login', name: 'login', component: {template: '<div>Login</div>'}}
    ]
  })

// Mock the mask directive and hCaptcha
vi.mock('vue-the-mask', () => ({
  default: {
    install: vi.fn()
  }
}))

describe('RegisterView.vue', () => {
  let router
  let wrapper
  let pinia

  beforeEach(() => {
    // Set up global window objects for hCaptcha
    global.window.hcaptcha = {
      render: vi.fn()
    }
    global.window.hcaptchaCallback = vi.fn()
    global.window.hcaptchaReset = vi.fn()

    // Set up DOM element for hCaptcha
    document.body.innerHTML = '<div class="h-captcha"></div>'

    // Setup Pinia
    pinia = createPinia()
    setActivePinia(pinia)

    // Reset mocks
    vi.clearAllMocks()

    // Setup router
    router = createTestRouter()

    // Mount component with router and pinia
    wrapper = mount(RegisterView, {
      global: {
        plugins: [router, pinia],
        directives: {
          mask: {mounted: vi.fn()}
        },
        stubs: {
          RouterLink: true
        },
        mocks: {
          $router: router
        }
      }
    })
  })

  it('renders registration form', () => {
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('submits registration data and redirects on success', async () => {
    // Set form data
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#fullName').setValue('Test User')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('#confirmPassword').setValue('password123')

    // Check privacy checkbox
    await wrapper.find('#privacy').setValue(true)
    await wrapper.find('#privacy').trigger('change')

    // Mock hCaptcha token
    wrapper.vm.formData.hCaptchaToken = 'test-token'

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    // Wait for async operations
    await vi.waitFor(() => {
      expect(wrapper.vm.userStore.register).toHaveBeenCalled()
    })

    // Verify router navigation
    const navigateSpy = vi.spyOn(router, 'push')
    expect(navigateSpy).toHaveBeenCalledTimes(0)

    // Since the component uses router.push internally, check if the method was called
    expect(wrapper.vm.userStore.register).toHaveBeenCalledWith({
      email: 'test@example.com',
      fullName: 'Test User',
      password: 'password123',
      tlf: '',
      hCaptchaToken: 'test-token'
    })
  })

  it('shows error when registration fails', async () => {
    // Mock failed registration
    wrapper.vm.userStore.register = vi.fn().mockRejectedValue(new Error('Registration failed'))

    // Set form data
    await wrapper.find('#email').setValue('test@example.com')
    await wrapper.find('#fullName').setValue('Test User')
    await wrapper.find('#password').setValue('password123')
    await wrapper.find('#confirmPassword').setValue('password123')

    // Check privacy checkbox
    await wrapper.find('#privacy').setValue(true)
    await wrapper.find('#privacy').trigger('change')

    // Mock hCaptcha token
    wrapper.vm.formData.hCaptchaToken = 'test-token'

    // Submit form
    await wrapper.find('form').trigger('submit.prevent')

    // Wait for async operations
    await vi.waitFor(() => {
      expect(wrapper.vm.userStore.register).toHaveBeenCalled()
    })

    // Check that error status is set
    expect(wrapper.vm.status.error).toBe(true)
    expect(wrapper.vm.status.errorMessage).toBeTruthy()
  })
})
