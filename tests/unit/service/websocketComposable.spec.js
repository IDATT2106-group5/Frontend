/* global setImmediate, global */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import useWebSocket from '@/service/websocketComposable.js'

vi.mock('@/stores/UserStore.js', () => ({
  useUserStore: () => ({ user: { id: 'user1' }, token: 'token123' }),
}))

const checkCurrentHousehold = vi.fn().mockResolvedValue(undefined)
vi.mock('@/stores/HouseholdStore.js', () => ({
  useHouseholdStore: () => ({ currentHousehold: { id: 'houseA' }, checkCurrentHousehold }),
}))

const initSpy = vi.fn()
const subPosSpy = vi.fn()
const updPosSpy = vi.fn()
const discSpy = vi.fn()
vi.mock('@/service/websocketService.js', () => ({
  default: class {
    init = initSpy
    subscribeToPosition = subPosSpy
    updatePosition = updPosSpy
    disconnect = discSpy
  }
}))

const flushPromises = () => new Promise((r) => setImmediate(r))

describe('useWebSocket composable', () => {
  let wrapper;  

  beforeEach(async () => {
    initSpy.mockClear()
    subPosSpy.mockClear()
    updPosSpy.mockClear()
    discSpy.mockClear()
    checkCurrentHousehold.mockClear()

    wrapper = mount({
      template: `<div/>`,
      setup() {
        return useWebSocket()
      }
    })

    await nextTick()
    await nextTick()
    await flushPromises()
  })

  it('calls WebSocketService.init on mount', () => {
    expect(checkCurrentHousehold).not.toHaveBeenCalled()
    expect(initSpy).toHaveBeenCalledTimes(1)
    const args = initSpy.mock.calls[0][0]
    expect(args.userId).toBe('user1')
    expect(args.token).toBe('token123')
    expect(args.householdId).toBe('houseA')
    expect(typeof args.onConnected).toBe('function')
    expect(typeof args.onDisconnected).toBe('function')
    expect(typeof args.onNotification).toBe('function')
  })

  it('resetNotificationCount resets notificationCount', () => {
    wrapper.vm.notificationCount = 5
    wrapper.vm.resetNotificationCount()
    expect(wrapper.vm.notificationCount).toBe(0)
  })

  it('closeIncidentPopup clears flags', () => {
    wrapper.vm.showIncidentPopup = true
    wrapper.vm.currentIncident = { foo: 'bar' }
    wrapper.vm.closeIncidentPopup()
    expect(wrapper.vm.showIncidentPopup).toBe(false)
    expect(wrapper.vm.currentIncident).toBeNull()
  })

  it('subscribeToPosition delegates to WebSocketService', async () => {
    await wrapper.vm.subscribeToPosition('houseA', () => {})
    expect(subPosSpy).toHaveBeenCalledWith('houseA', expect.any(Function))
  })

  it('updatePosition delegates to WebSocketService', () => {
    wrapper.vm.updatePosition('u2', 10, 20)
    expect(updPosSpy).toHaveBeenCalledWith('u2', 10, 20)
  })

  it('fetchNotifications loads and counts unread', async () => {
    const data = [ { id: 1, read: false }, { id: 2, read: true } ]
    global.fetch = vi.fn(() => Promise.resolve({ json: () => data }))
    await wrapper.vm.fetchNotifications('user1')
    expect(wrapper.vm.notifications).toEqual(data)
    expect(wrapper.vm.notificationCount).toBe(1)
  })

  it('fetchNotifications early returns if no userId', async () => {
    global.fetch = vi.fn()
    await wrapper.vm.fetchNotifications(null)
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('fetchHouseholdPositions returns data or [] on error', async () => {
    const positions = [ { x: 1 }, { x: 2 } ]
    global.fetch = vi.fn(() => Promise.resolve({ json: () => positions }))
    expect(await wrapper.vm.fetchHouseholdPositions()).toEqual(positions)

    global.fetch = vi.fn(() => Promise.reject(new Error('fail')))
    expect(await wrapper.vm.fetchHouseholdPositions()).toEqual([])
  })

  it('markAsRead flips read flag and decrements count', async () => {
    const fake = [ { id: 1, read: false }, { id: 2, read: false } ]
    global.fetch = vi.fn(() => Promise.resolve({ json: () => fake }))
    wrapper.vm.notifications = [ { id: 1, read: false }, { id: 2, read: false } ]
    wrapper.vm.notificationCount = 2

    await wrapper.vm.markAsRead(1)
    expect(wrapper.vm.notifications.find(n => n.id === 1).read).toBe(true)
    expect(wrapper.vm.notificationCount).toBe(1)
  })
})
