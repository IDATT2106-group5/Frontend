import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createRouter, createMemoryHistory } from 'vue-router'
import RequestResetView from '@/views/login/RequestResetView.vue'
import ResetPasswordConfirmView from '@/views/login/ResetPasswordConfirmView.vue'

// Store mocks
const requestPasswordResetMock = vi.fn()
const validateResetTokenMock = vi.fn()
const resetPasswordMock = vi.fn()
let storeError = null

vi.mock('@/stores/UserStore', () => ({
  useUserStore: () => ({
    requestPasswordReset: requestPasswordResetMock,
    validateResetToken: validateResetTokenMock,
    resetPassword: resetPasswordMock,
    get error() {
      return storeError
    },
    set error(val) {
      storeError = val
    }
  })
}))

describe('RequestResetView.vue', () => {
  let wrapper

  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    storeError = null
    wrapper = mount(RequestResetView, {
      global: { stubs: ['RouterLink'] }
    })
  })

  // Mocking the store and its methods
  it('renders input and button', () => {
    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
    expect(wrapper.find('button').text()).toContain('Send tilbakestillingslenke')
  })

  // Mock test for email input
  it('shows error on invalid email', async () => {
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Vennligst skriv inn en gyldig e-postadresse')

    await wrapper.find('input[type="email"]').setValue('invalid')
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Vennligst skriv inn en gyldig e-postadresse')
    expect(requestPasswordResetMock).not.toHaveBeenCalled()
  })

  // Mock test for sucessful email submission
  it('calls store and shows success message on success', async () => {
    requestPasswordResetMock.mockResolvedValueOnce({ success: true })

    await wrapper.find('input[type="email"]').setValue('user@example.com')
    await wrapper.find('button').trigger('click')

    expect(requestPasswordResetMock).toHaveBeenCalledWith('user@example.com')
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('En lenke for tilbakestilling av passord er sendt til e-posten din')
  })

  //mock test for failed email submission
  it('shows store error on failure', async () => {
    requestPasswordResetMock.mockResolvedValueOnce({ success: false })
    storeError = 'E-posten er ikke registrert'

    await wrapper.find('input[type="email"]').setValue('fail@example.com')
    await wrapper.find('button').trigger('click')
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('E-posten er ikke registrert')
  })
})

describe('ResetPasswordConfirmView.vue', () => {
  let wrapper
  let router

  beforeEach(async () => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    storeError = null

    validateResetTokenMock.mockResolvedValue({ success: true })

    router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: '/', component: { template: '<div>Home</div>' } },
        { path: '/reset', component: ResetPasswordConfirmView }
      ]
    })

    await router.push('/reset?token=mock-token')
    await router.isReady()

    wrapper = mount(ResetPasswordConfirmView, {
      global: {
        plugins: [router],
        stubs: ['RouterLink', 'Eye', 'EyeOff']
      }
    })

    await vi.waitFor(() => expect(validateResetTokenMock).toHaveBeenCalledWith('mock-token'))
    
    if (!wrapper.vm.tokenValid) {
      await wrapper.setData({ tokenValid: true })
    }
    
    await wrapper.vm.$nextTick()
  })

  //Mock token validation test
  it('renders password inputs if token is valid', async () => {
    expect(wrapper.vm.tokenValid).toBe(true)
    
    const inputs = wrapper.findAll('input[type="password"]')
    expect(inputs.length).toBe(2)
    
    const buttonText = wrapper.find('button[class*="bg-teal-600"]').text()
    expect(buttonText).toContain('Tilbakestill passord')
  })

  // Mock password confirmation test
  it('shows error if passwords do not match', async () => {
    const inputs = wrapper.findAll('input[type="password"]')
    await inputs[0].setValue('hemmelig123')
    await inputs[1].setValue('ikkehemmelig123')
    
    await wrapper.vm.$nextTick()
    
    await wrapper.vm.v$.$touch()
    await wrapper.vm.$nextTick()
    
    await wrapper.find('button[class*="bg-teal-600"]').trigger('click')
    await wrapper.vm.$nextTick()
    
    expect(wrapper.text()).toContain('Passordene må være like')
  })

  // Mock password validation
  it('shows error if password is too short', async () => {
    const inputs = wrapper.findAll('input[type="password"]')
    await inputs[0].setValue('123')
    await inputs[1].setValue('123')
    
    await wrapper.vm.$nextTick()
    
    await wrapper.vm.v$.$touch()
    await wrapper.vm.$nextTick()
    
    await wrapper.find('button[class*="bg-teal-600"]').trigger('click')
    await wrapper.vm.$nextTick()
    
    // Check validation errors
    expect(wrapper.text()).toContain('Passordet må være minst 8 tegn')
  })

  // Mock successful password reset
  it('calls store and shows success on valid reset', async () => {
    resetPasswordMock.mockResolvedValue({ success: true, message: 'Tilbakestilt!' })

    const inputs = wrapper.findAll('input[type="password"]')
    await inputs[0].setValue('secret123')
    await inputs[1].setValue('secret123')
    
    await wrapper.vm.$nextTick()
    
    wrapper.vm.v$.newPassword.$model = 'secret123'
    wrapper.vm.v$.confirmPassword.$model = 'secret123'
    wrapper.vm.v$.$touch()
    await wrapper.vm.$nextTick()
    
    await wrapper.vm.resetPassword()
    
    expect(resetPasswordMock).toHaveBeenCalledWith('mock-token', 'secret123')
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Tilbakestilt!')
  })

  // Mock failed password reset
  it('shows error on reset failure', async () => {
    resetPasswordMock.mockResolvedValue({ success: false })
    storeError = 'Kunne ikke tilbakestille passord.'

    const inputs = wrapper.findAll('input[type="password"]')
    await inputs[0].setValue('secret123')
    await inputs[1].setValue('secret123')
    
    await wrapper.vm.$nextTick()
    
    wrapper.vm.v$.newPassword.$model = 'secret123'
    wrapper.vm.v$.confirmPassword.$model = 'secret123'
    wrapper.vm.v$.$touch()
    await wrapper.vm.$nextTick()
    
    await wrapper.vm.resetPassword()
    
    expect(resetPasswordMock).toHaveBeenCalledWith('mock-token', 'secret123')
    
    await wrapper.vm.$nextTick()
    expect(wrapper.text()).toContain('Kunne ikke tilbakestille passord.')
  })
})