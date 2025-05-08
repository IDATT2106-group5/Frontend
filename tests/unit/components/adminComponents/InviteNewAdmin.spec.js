import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import InviteNewAdmin from '@/components/adminComponents/InviteNewAdmin.vue'

vi.mock('@/components/ui/input', () => ({
  Input: {
    name: 'Input',
    template: '<input :value="modelValue" @input="$emit(\'update:modelValue\', $event.target.value)" v-bind="$attrs" />'
  }
}))

vi.mock('@/components/ui/button', () => ({
  Button: {
    name: 'Button',
    template: '<button type="submit" v-bind="$attrs"><slot></slot></button>'
  }
}))

vi.mock('lucide-vue-next', () => ({
  Mail: {
    name: 'Mail',
    template: '<svg data-testid="mail-icon"></svg>'
  },
  User: {
    name: 'User',
    template: '<svg data-testid="user-icon"></svg>'
  }
}))

describe('InviteNewAdmin.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(InviteNewAdmin)
  })

  it('renders the form with correct fields', () => {
    expect(wrapper.find('form').exists()).toBe(true)
    expect(wrapper.find('#email').exists()).toBe(true)
    expect(wrapper.find('#fullName').exists()).toBe(true)
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
  })

  it('shows validation errors for empty required fields', async () => {
    await wrapper.find('#email').trigger('blur')
    await wrapper.find('#fullName').trigger('blur')

    await flushPromises()

    const errorMessages = wrapper.findAll('.text-red-500')
    expect(errorMessages.length).toBeGreaterThan(0)
    expect(wrapper.text()).toContain('E-post er påkrevd')
    expect(wrapper.text()).toContain('Navn er påkrevd')
  })

  it('validates email format', async () => {
    await wrapper.find('#email').setValue('invalid-email')
    await wrapper.find('#email').trigger('blur')

    await flushPromises()

    expect(wrapper.text()).toContain('Vennligst oppgi en gyldig e-postadresse')
  })

  it('validates name contains only letters and spaces', async () => {
    await wrapper.find('#fullName').setValue('John123')
    await wrapper.find('#fullName').trigger('blur')

    await flushPromises()

    expect(wrapper.text()).toContain('Navnet kan kun inneholde bokstaver og mellomrom')
  })

  it('disables submit button when form is invalid', async () => {
    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeDefined()

    await wrapper.find('#email').setValue('valid@example.com')
    await wrapper.find('#fullName').setValue('John Doe')

    await wrapper.vm.v$.$validate()
    await flushPromises()

    expect(wrapper.find('button[type="submit"]').attributes('disabled')).toBeUndefined()
  })

  it('emits invite-admin event with correct data on form submission', async () => {
    await wrapper.find('#email').setValue('admin@example.com')
    await wrapper.find('#fullName').setValue('Test Admin')

    await wrapper.vm.v$.$validate()
    await flushPromises()

    await wrapper.vm.submitForm()
    await flushPromises()

    const emittedEvents = wrapper.emitted('invite-admin')
    expect(emittedEvents).toBeTruthy()
    expect(emittedEvents[0][0]).toEqual({
      email: 'admin@example.com',
      fullName: 'Test Admin'
    })
  })

  it('shows loading state in button during submission', async () => {
    await wrapper.find('#email').setValue('admin@example.com')
    await wrapper.find('#fullName').setValue('Test Admin')

    await wrapper.vm.v$.$validate()
    await flushPromises()

    wrapper.vm.isSubmitting = true
    await flushPromises()

    expect(wrapper.find('button[type="submit"]').text()).toBe('Sender...')
  })

  it('resetForm method clears form fields and resets validation', async () => {
    await wrapper.find('#email').setValue('admin@example.com')
    await wrapper.find('#fullName').setValue('Test Admin')

    await wrapper.vm.v$.$validate()
    await flushPromises()

    wrapper.vm.resetForm()
    await flushPromises()

    expect(wrapper.vm.formData.email).toBe('')
    expect(wrapper.vm.formData.fullName).toBe('')
    expect(wrapper.vm.isSubmitting).toBe(false)

    expect(wrapper.vm.v$.$errors.length).toBe(0)
  })

  it('does not submit form when validation fails', async () => {
    await wrapper.find('#email').setValue('invalid')
    await wrapper.find('#fullName').setValue('Test123')

    await wrapper.find('form').trigger('submit')
    await flushPromises()

    const emittedEvents = wrapper.emitted('invite-admin')
    expect(emittedEvents).toBeUndefined()
  })
})
