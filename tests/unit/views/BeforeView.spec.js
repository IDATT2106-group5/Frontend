import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import BeforeView from '@/views/informationViews/BeforeView.vue'

const mockPush = vi.fn()

vi.mock('vue-router', async () => {
  const actual = await vi.importActual('vue-router')
  return {
    ...actual,
    useRouter: () => ({
      push: mockPush,
    }),
  }
})

describe('BeforeView.vue', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('navigates to /under when the desktop "UNDER KRISE" button is clicked', async () => {
    const wrapper = mount(BeforeView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const desktopButton = buttons.find((btn) =>
      btn.text().includes('UNDER') && btn.classes().includes('lg:flex')
    )

    expect(desktopButton).toBeTruthy()
    await desktopButton?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/under')
  })

  it('navigates to /under when the mobile "UNDER KRISE" button is clicked', async () => {
    const wrapper = mount(BeforeView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const mobileButton = buttons.find((btn) =>
      btn.text().includes('UNDER') && !btn.classes().includes('lg:flex')
    )

    expect(mobileButton).toBeTruthy()
    await mobileButton?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/under')
  })
})
