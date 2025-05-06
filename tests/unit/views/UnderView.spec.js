import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import UnderView from '@/views/informationViews/UnderView.vue'

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

describe('UnderView.vue', () => {
  beforeEach(() => {
    mockPush.mockClear()
  })

  it('navigates to /before when desktop "FØR KRISE" button is clicked', async () => {
    const wrapper = mount(UnderView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const desktopBefore = buttons.find(
      (btn) =>
        btn.text().includes('FØR') &&
        btn.classes().includes('lg:flex') &&
        btn.text().includes('←')
    )

    expect(desktopBefore).toBeTruthy()
    await desktopBefore?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/before')
  })

  it('navigates to /after when desktop "ETTER KRISE" button is clicked', async () => {
    const wrapper = mount(UnderView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const desktopAfter = buttons.find(
      (btn) =>
        btn.text().includes('ETTER') &&
        btn.classes().includes('lg:flex') &&
        btn.text().includes('→')
    )

    expect(desktopAfter).toBeTruthy()
    await desktopAfter?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/after')
  })

  it('navigates to /before when mobile "FØR KRISE" button is clicked', async () => {
    const wrapper = mount(UnderView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const mobileBefore = buttons.find(
      (btn) =>
        btn.text().includes('FØR') &&
        !btn.classes().includes('lg:flex') &&
        btn.text().includes('←')
    )

    expect(mobileBefore).toBeTruthy()
    await mobileBefore?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/before')
  })

  it('navigates to /after when mobile "ETTER KRISE" button is clicked', async () => {
    const wrapper = mount(UnderView, {
      global: {
        stubs: ['MainCard', 'InfoBox', 'StepIndicator', 'ArrowIcon'],
      },
    })

    const buttons = wrapper.findAll('button')
    const mobileAfter = buttons.find(
      (btn) =>
        btn.text().includes('ETTER') &&
        !btn.classes().includes('lg:flex') &&
        btn.text().includes('→')
    )

    expect(mobileAfter).toBeTruthy()
    await mobileAfter?.trigger('click')
    expect(mockPush).toHaveBeenCalledWith('/after')
  })
})
