import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createMemoryHistory } from 'vue-router'
import StepIndicator from '@/components/StepIndicator.vue'

// Mock router
const routes = [
  { path: '/before', component: {} },
  { path: '/under', component: {} },
  { path: '/after', component: {} }
]

describe('StepIndicator', () => {
  let router

  beforeEach(async () => {
    // Create a fresh router instance for each test
    router = createRouter({
      history: createMemoryHistory(),
      routes
    })
    
    // Clear all router navigation guards from previous tests
    router.beforeEach(() => {})
  })

  it('renders all three step indicators', async () => {
    // Start at /before route
    router.push('/before')
    await router.isReady()

    const wrapper = mount(StepIndicator, {
      global: {
        plugins: [router]
      }
    })

    // Check that all three links exist
    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    expect(links.length).toBe(3)
    
    // Check link destinations
    expect(links[0].props().to).toBe('/before')
    expect(links[1].props().to).toBe('/under')
    expect(links[2].props().to).toBe('/after')
    
    // Check link texts
    expect(links[0].text()).toContain('Før')
    expect(links[1].text()).toContain('Under')
    expect(links[2].text()).toContain('Etter')
  })

  it('applies active styling to current route - /before', async () => {
    // Start at /before route
    router.push('/before')
    await router.isReady()

    const wrapper = mount(StepIndicator, {
      global: {
        plugins: [router]
      }
    })

    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    
    // The first link should NOT have opacity-50 class (it's active)
    expect(links[0].classes()).not.toContain('opacity-50')
    
    // The other links should have opacity-50 class (they're inactive)
    expect(links[1].classes()).toContain('opacity-50')
    expect(links[2].classes()).toContain('opacity-50')
    
    // Check circles (dots)
    const circles = wrapper.findAll('div.rounded-full')
    expect(circles[0].classes()).toContain('bg-[#2c3e50]')
    expect(circles[1].classes()).toContain('border-2')
    expect(circles[2].classes()).toContain('border-2')
    
    // Check text styling
    const spans = wrapper.findAll('span')
    expect(spans[0].classes()).toContain('font-semibold')
    expect(spans[1].classes()).not.toContain('font-semibold')
    expect(spans[2].classes()).not.toContain('font-semibold')
  })

  it('applies active styling to current route - /under', async () => {
    // Start at /under route
    router.push('/under')
    await router.isReady()

    const wrapper = mount(StepIndicator, {
      global: {
        plugins: [router]
      }
    })

    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    
    // The second link should NOT have opacity-50 class (it's active)
    expect(links[0].classes()).toContain('opacity-50')
    expect(links[1].classes()).not.toContain('opacity-50')
    expect(links[2].classes()).toContain('opacity-50')
    
    // Check circles (dots)
    const circles = wrapper.findAll('div.rounded-full')
    expect(circles[0].classes()).toContain('border-2')
    expect(circles[1].classes()).toContain('bg-[#2c3e50]')
    expect(circles[2].classes()).toContain('border-2')
    
    // Check text styling
    const spans = wrapper.findAll('span')
    expect(spans[0].classes()).not.toContain('font-semibold')
    expect(spans[1].classes()).toContain('font-semibold')
    expect(spans[2].classes()).not.toContain('font-semibold')
  })

  it('applies active styling to current route - /after', async () => {
    // Start at /after route
    router.push('/after')
    await router.isReady()

    const wrapper = mount(StepIndicator, {
      global: {
        plugins: [router]
      }
    })

    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    
    // The third link should NOT have opacity-50 class (it's active)
    expect(links[0].classes()).toContain('opacity-50')
    expect(links[1].classes()).toContain('opacity-50')
    expect(links[2].classes()).not.toContain('opacity-50')
    
    // Check circles (dots)
    const circles = wrapper.findAll('div.rounded-full')
    expect(circles[0].classes()).toContain('border-2')
    expect(circles[1].classes()).toContain('border-2')
    expect(circles[2].classes()).toContain('bg-[#2c3e50]')
    
    // Check text styling
    const spans = wrapper.findAll('span')
    expect(spans[0].classes()).not.toContain('font-semibold')
    expect(spans[1].classes()).not.toContain('font-semibold')
    expect(spans[2].classes()).toContain('font-semibold')
  })

  it('navigates when clicking on links', async () => {
    // Start at /before route
    router.push('/before')
    await router.isReady()

    const wrapper = mount(StepIndicator, {
      global: {
        plugins: [router]
      }
    })

    // Spy on router push method
    const routerPushSpy = vi.spyOn(router, 'push')

    // Get all links
    const links = wrapper.findAllComponents({ name: 'RouterLink' })
    
    // Click on the 'Under' link
    await links[1].trigger('click')
    
    // Check that router.push was called with the correct path
    expect(routerPushSpy).toHaveBeenCalledWith('/under')
    
    // Click on the 'Etter' link
    await links[2].trigger('click')
    
    // Check that router.push was called with the correct path
    expect(routerPushSpy).toHaveBeenCalledWith('/after')
  })
})