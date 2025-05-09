import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PasswordRequirementsList from '@/components/passwordRequirement/PasswordRequirementsList.vue'

vi.mock('@/components/passwordRequirement/PasswordRequirementCheck.vue', () => ({
  default: {
    name: 'PasswordRequirementCheck',
    props: ['isPassing', 'text'],
    template: '<li data-testid="requirement" :data-passing="isPassing">{{ text }}</li>'
  }
}))

const createMockValidator = (validStates) => {
  const validator = {
    $errors: []
  };

  Object.entries(validStates).forEach(([key, isValid]) => {
    const valid = typeof isValid === 'object' ? isValid.$valid : isValid;
    validator[key] = { $valid: valid };

    if (!valid) {
      validator.$errors.push({
        $validator: key,
        $message: `Mock error for ${key}`
      });
    }
  });

  return validator;
};

describe('PasswordRequirementsList.vue', () => {
  it('renders correctly with default props', () => {
    const mockValidator = createMockValidator({
      minLength: false,
      containsUppercase: false ,
      containsLowercase: false ,
      containsNumber: false,
      containsSpecial: false
    });

    const wrapper = mount(PasswordRequirementsList, {
      props: {
        password: '',
        validator: mockValidator
      }
    });

    expect(wrapper.text()).toContain('Passordet må inneholde:')

    expect(wrapper.findAll('[data-testid="requirement"]').length).toBe(5)
  })

  it('passes the correct props to PasswordRequirementCheck components', () => {
    const mockValidator = createMockValidator({
      minLength: { $valid: true },
      containsUppercase: { $valid: false },
      containsLowercase: { $valid: true },
      containsNumber: { $valid: false },
      containsSpecial: { $valid: true }
    });

    const wrapper = mount(PasswordRequirementsList, {
      props: {
        password: 'test123',
        validator: mockValidator
      }
    });

    const requirements = wrapper.findAll('[data-testid="requirement"]')

    expect(requirements[0].attributes('data-passing')).toBe('true')
    expect(requirements[1].attributes('data-passing')).toBe('false')
  })

  it('shows all requirements as not passing when password is empty', () => {
    const mockValidator = createMockValidator({
      minLength:  true,
      containsUppercase: true,
      containsLowercase: true,
      containsNumber: true,
      containsSpecial: true
    });

    const wrapper = mount(PasswordRequirementsList, {
      props: {
        password: '',
        validator: mockValidator
      }
    });

    const requirements = wrapper.findAll('[data-testid="requirement"]')
    requirements.forEach(req => {
      expect(req.attributes('data-passing')).toBe('false')
    });
  })

  it('renders custom requirements when provided', () => {
    const mockValidator = createMockValidator({
      customRule1: true,
      customRule2: false
    });

    const customRequirements = [
      { validator: 'customRule1', text: 'Custom rule 1' },
      { validator: 'customRule2', text: 'Custom rule 2' }
    ]

    const wrapper = mount(PasswordRequirementsList, {
      props: {
        password: 'validpassword',
        validator: mockValidator,
        requirements: customRequirements
      }
    })

    const requirements = wrapper.findAll('[data-testid="requirement"]')

    expect(requirements.length).toBe(2)

    expect(requirements[0].text()).toBe('Custom rule 1')
    expect(requirements[1].text()).toBe('Custom rule 2')

    expect(requirements[0].attributes('data-passing')).toBe('true')
    expect(requirements[1].attributes('data-passing')).toBe('false')
  })
})
