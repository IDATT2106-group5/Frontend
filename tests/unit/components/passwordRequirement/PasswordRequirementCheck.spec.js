import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordRequirementCheck from '@/components/passwordRequirement/PasswordRequirementCheck.vue'
import { Check, X } from 'lucide-vue-next'

describe('PasswordRequirementCheck.vue', () => {
  it('renders with correct text', () => {
    const text = 'Must contain a number'
    const wrapper = mount(PasswordRequirementCheck, {
      props: {
        isPassing: false,
        text: text
      }
    })

    expect(wrapper.text()).toContain(text)
  })

  it('displays Check icon when requirement is passing', () => {
    const wrapper = mount(PasswordRequirementCheck, {
      props: {
        isPassing: true,
        text: 'Some requirement'
      }
    })

    expect(wrapper.findComponent(Check).exists()).toBeTruthy()
    expect(wrapper.findComponent(X).exists()).toBeFalsy()
  })

  it('displays X icon when requirement is not passing', () => {
    const wrapper = mount(PasswordRequirementCheck, {
      props: {
        isPassing: false,
        text: 'Some requirement'
      }
    })

    expect(wrapper.findComponent(X).exists()).toBeTruthy()
    expect(wrapper.findComponent(Check).exists()).toBeFalsy()
  })

  it('applies green text when requirement is passing', () => {
    const wrapper = mount(PasswordRequirementCheck, {
      props: {
        isPassing: true,
        text: 'Some requirement'
      }
    })

    expect(wrapper.find('li').classes()).toContain('text-green-600')
    expect(wrapper.find('li').classes()).not.toContain('text-gray-600')
  })

  it('applies gray text when requirement is not passing', () => {
    const wrapper = mount(PasswordRequirementCheck, {
      props: {
        isPassing: false,
        text: 'Some requirement'
      }
    })

    expect(wrapper.find('li').classes()).toContain('text-gray-600')
    expect(wrapper.find('li').classes()).not.toContain('text-green-600')
  })

  it('renders content from slot instead of text prop when slot is provided', () => {
    const slotContent = 'Custom slot content'
    const wrapper = mount(PasswordRequirementCheck, {
      props: {
        isPassing: true,
        text: 'This text should not show'
      },
      slots: {
        default: slotContent
      }
    })

    expect(wrapper.text()).toContain(slotContent)
    expect(wrapper.text()).not.toContain('This text should not show')
  })
})
