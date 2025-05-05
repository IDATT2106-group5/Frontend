import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import AfterView from '@/views/informationViews/AfterView.vue'

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

describe('AfterView.vue', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('navigates to /under when desktop "UNDER KRISE" button is clicked', async () => {
    const wrapper = mount(AfterView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const desktopButton = buttons.find(
      (btn) =>
        btn.text().includes('UNDER') &&
        btn.classes().includes('lg:flex') &&
        btn.text().includes('←')
    )

    expect(desktopButton).toBeTruthy()
    await desktopButton?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/under')
  })

  it('navigates to /under when mobile "UNDER KRISE" button is clicked', async () => {
    const wrapper = mount(AfterView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const mobileButton = buttons.find(
      (btn) =>
        btn.text().includes('UNDER') &&
        !btn.classes().includes('lg:flex') &&
        btn.text().includes('←')
    )

    expect(mobileButton).toBeTruthy()
    await mobileButton?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/under')
  })
})
