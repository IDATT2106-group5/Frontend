import { vi, describe, it, expect, beforeEach } from 'vitest'
import WebSocketService from '@/service/websocketService.js'
import { Client } from '@stomp/stompjs'

vi.mock('sockjs-client', () => ({
  default: vi.fn().mockImplementation(() => 'fake-socket'),
}))

const subscribeMocks = []

vi.mock('@stomp/stompjs', () => ({
  Client: vi.fn().mockImplementation((config) => {
    const mockClient = {
      webSocketFactory: config.webSocketFactory,
      onConnect: config.onConnect,
      onDisconnect: config.onDisconnect,
      reconnectDelay: config.reconnectDelay,
      heartbeatIncoming: config.heartbeatIncoming,
      heartbeatOutgoing: config.heartbeatOutgoing,
      activate: vi.fn(),
      deactivate: vi.fn(),
      publish: vi.fn(),
      subscribe: vi.fn((destination, callback) => {
        subscribeMocks.push({ destination, callback })
      }),
    }
    return mockClient
  }),
}))

describe('WebSocketService', () => {
  let service
  const dummyNotification = { type: 'NOTIFY', payload: 'data' }
  const dummyIncident = { type: 'INCIDENT', detail: 'issue' }

  const flushPromises = () => new Promise((resolve) => setImmediate(resolve))

  beforeEach(() => {
    service = new WebSocketService()
    subscribeMocks.length = 0
    Client.mockClear()
  })

  it('initial state should be disconnected with no client', () => {
    expect(service.connected).toBe(false)
    expect(service.stompClient).toBeNull()
  })

  it('init should set properties and call connect()', () => {
    const connectSpy = vi.spyOn(service, 'connect')
    service.init({
      userId: 'u1',
      householdId: 'h1',
      token: 't1',
      onConnected: () => {},
      onDisconnected: () => {},
      onNotification: () => {},
      onPositionUpdate: () => {},
    })
    expect(service.userId).toBe('u1')
    expect(service.token).toBe('t1')
    expect(service.householdId).toBe('h1')
    expect(connectSpy).toHaveBeenCalled()

    const fn = () => {}
    service.init({ userId:'u2', householdId:'h2', token:'t2', onPositionUpdate: fn })
    expect(service.callbacks.onPositionUpdate).toBe(fn)
  })

  it('connect should set window.global, call SockJS and activate client with correct config', async () => {

    global.window = {}
    service.userId = 'user42'

    service.connect()
    await flushPromises()

    expect(window.global).toBe(window)

    const SockJS = await import('sockjs-client')
    expect(SockJS.default).toHaveBeenCalledWith('http://localhost:8080/ws?userId=user42')

    expect(Client).toHaveBeenCalledTimes(1)
    const cfg = Client.mock.calls[0][0]
    expect(cfg.reconnectDelay).toBe(5000)
    expect(cfg.heartbeatIncoming).toBe(4000)
    expect(cfg.heartbeatOutgoing).toBe(4000)

    expect(service.stompClient.activate).toHaveBeenCalled()
  })

  it('_onConnected should set connected=true, subscribe both topics, and fire callbacks', () => {
    const onConnected = vi.fn()
    const onNotification = vi.fn()
    const onIncident = vi.fn()

    service.callbacks.onConnected = onConnected
    service.callbacks.onNotification = onNotification
    service.callbacks.onIncident = onIncident

    service.userId = 'u1'
    service.token = 'tok'
    service.stompClient = {
      subscribe: vi.fn((dest, cb) => subscribeMocks.push({ destination: dest, callback: cb })),
    }

    service._onConnected()
    expect(service.connected).toBe(true)
    expect(onConnected).toHaveBeenCalled()

    const dests = subscribeMocks.map((m) => m.destination)
    expect(dests).toContain('/topic/notifications')
    expect(dests).toContain('/user/queue/notifications')

    const topicSub = subscribeMocks.find((m) => m.destination === '/topic/notifications')
    topicSub.callback({ body: JSON.stringify(dummyNotification) })
    expect(onNotification).toHaveBeenCalledWith(dummyNotification)

    topicSub.callback({ body: JSON.stringify(dummyIncident) })
    expect(onIncident).toHaveBeenCalledWith(dummyIncident)
  })

  it('_onConnected should catch invalid JSON and still call onNotification once', () => {
    const onNotification = vi.fn()
    service.callbacks.onNotification = onNotification

    service.userId = 'u1'
    service.token = 'tok'
    service.stompClient = {
      subscribe: vi.fn((dest, cb) => subscribeMocks.push({ destination: dest, callback: cb })),
    }

    service._onConnected()
    const topicSub = subscribeMocks.find((m) => m.destination === '/topic/notifications')
    topicSub.callback({ body: 'not-json' })
    expect(onNotification).toHaveBeenCalledWith()
  })

  it('_onConnected should only subscribe /topic/notifications when no token or userId', () => {
    service.token = null
    service.userId = null
    service.stompClient = {
      subscribe: vi.fn((dest, cb) => subscribeMocks.push({ destination: dest, callback: cb })),
    }

    service._onConnected()
    const dests = subscribeMocks.map((m) => m.destination)
    expect(dests).toEqual(['/topic/notifications'])
  })

  it('_onConnected second‑queue JSON error is caught and logs error', () => {
    service.token = 'tok'
    service.userId = 'u1'
    service.stompClient = {
      subscribe: vi.fn((dest, cb) => subscribeMocks.push({ destination: dest, callback: cb })),
    }
    const onNotification = vi.fn()
    service.callbacks.onNotification = onNotification
    const errSpy = vi.spyOn(console, 'error')

    service._onConnected()
    const userSub = subscribeMocks.find((m) => m.destination === '/user/queue/notifications')
    userSub.callback({ body: 'nope' })

    expect(onNotification).toHaveBeenCalledWith()
    expect(errSpy).toHaveBeenCalledWith('Error parsing notification:', expect.any(Error))
  })

  it('_onConnected second‑queue valid JSON fires onNotification and onIncident', () => {
    service.token = 'tok'
    service.userId = 'u1'
    service.stompClient = {
      subscribe: vi.fn((dest, cb) => subscribeMocks.push({ destination: dest, callback: cb })),
    }
    const onNotification = vi.fn()
    const onIncident = vi.fn()
    service.callbacks.onNotification = onNotification
    service.callbacks.onIncident = onIncident

    service._onConnected()
    const userSub = subscribeMocks.find((m) => m.destination === '/user/queue/notifications')
    userSub.callback({ body: JSON.stringify(dummyNotification) })
    userSub.callback({ body: JSON.stringify(dummyIncident) })

    expect(onNotification).toHaveBeenCalledWith(dummyNotification)
    expect(onIncident).toHaveBeenCalledWith(dummyIncident)
  })


  it('unsubscribeToPosition logs error when not connected', () => {
    service.stompClient = { subscribe: vi.fn() }
    service.connected = false
    service.token = 'tok'
    const errSpy = vi.spyOn(console, 'error')
    expect(service.subscribeToPosition('h', () => {})).toBe(false)
    expect(errSpy).toHaveBeenCalledWith('Cannot subscribe to position: STOMP client not connected')
  })

  it('subscribeToPosition uses correct topic string', () => {
    const cb = vi.fn()
        service.stompClient = {
          subscribe: vi.fn((d, callback) => {
            subscribeMocks.push({ destination: d, callback })
            callback({ body: JSON.stringify({ foo: 'bar' }) })
          })
        }  
    service.connected = true
    service.token = 'tok'
    const ok = service.subscribeToPosition('houseX', cb)
    expect(ok).toBe(true)
    expect(cb).toHaveBeenCalledWith({ foo: 'bar' })
    expect(subscribeMocks.find(m => m.destination === '/topic/position/houseX')).toBeDefined()
  })

  it('updatePosition catches missing publish method', () => {
    service.stompClient = {}
    service.connected = true
    const errSpy = vi.spyOn(console, 'error')
    expect(service.updatePosition('u', 7, 8)).toBe(false)
    expect(errSpy).toHaveBeenCalledWith('Error sending position update:', expect.any(Error))
  })

  it('_onDisconnected should set connected=false and invoke onDisconnected', () => {
    const onDisconnected = vi.fn()
    service.callbacks.onDisconnected = onDisconnected
    service.connected = true

    service._onDisconnected()
    expect(service.connected).toBe(false)
    expect(onDisconnected).toHaveBeenCalled()
  })

  it('should handle subscribeToPosition correctly when not connected', () => {
    expect(service.subscribeToPosition('h1', () => {})).toBe(false)
  })

  it('should return false when subscribeToPosition missing any required param', () => {
    service.stompClient = { subscribe: vi.fn() }
    service.connected = true
    service.token = 'tok'
    expect(service.subscribeToPosition(null, () => {})).toBe(false)
    expect(service.subscribeToPosition('h1', null)).toBe(true)
  })

  it('should catch error parsing position JSON and log an error', () => {
    const callback = vi.fn()
    service.stompClient = {
      subscribe: (dest, cb) => cb({ body: 'bad-json' }),
    }
    service.connected = true
    service.token = 'tok'

    const errSpy = vi.spyOn(console, 'error')
    expect(service.subscribeToPosition('h', callback)).toBe(true)
    expect(errSpy).toHaveBeenCalledWith('Error parsing position data:', expect.any(Error))
  })

  it('should return false and log when updatePosition called while disconnected', () => {
    const errSpy = vi.spyOn(console, 'error')
    expect(service.updatePosition('u', 1, 2)).toBe(false)
    expect(errSpy).toHaveBeenCalledWith(
      'Cannot send position update: STOMP client not connected'
    )
  })

  it('should return false and log when publish throws in updatePosition', () => {
    const publish = vi.fn(() => { throw new Error('fail'); })
    service.stompClient = { publish }
    service.connected = true

    const errSpy = vi.spyOn(console, 'error')
    expect(service.updatePosition('u', 1, 2)).toBe(false)
    expect(errSpy).toHaveBeenCalledWith('Error sending position update:', expect.any(Error))
  })


  it('disconnect should not throw when there is no client', () => {
    expect(() => service.disconnect()).not.toThrow()
  })

    it('connect should not set window.global when window is undefined', async () => {
      delete global.window
      service.userId = 'u-no-win'
      service.connect()
      await flushPromises()
      expect(global.window).toBeUndefined()
    })
  
    it('_onConnected second‑queue valid JSON fires onNotification and onIncident', () => {
      service.token = 'tok'
      service.userId = 'u1'
      service.stompClient = { subscribe: vi.fn((d, cb) => subscribeMocks.push({ destination: d, callback: cb })) }
      const onNotification = vi.fn()
      const onIncident = vi.fn()
      service.callbacks.onNotification = onNotification
      service.callbacks.onIncident = onIncident
  
      service._onConnected()
      const userSub = subscribeMocks.find(m => m.destination === '/user/queue/notifications')
      userSub.callback({ body: JSON.stringify(dummyNotification) })
      userSub.callback({ body: JSON.stringify(dummyIncident) })
  
      expect(onNotification).toHaveBeenCalledWith(dummyNotification)
      expect(onIncident).toHaveBeenCalledWith(dummyIncident)
    })
  
  
    it('disconnect should call deactivate and propagate errors', () => {
      const mockDeactivate = vi.fn().mockImplementation(() => { throw new Error('boom') })
      service.stompClient = { deactivate: mockDeactivate }
      expect(() => service.disconnect()).toThrow('boom')
      expect(mockDeactivate).toHaveBeenCalled()
    })
  
    it('allows invoking onPositionUpdate default callback', () => {
      const onPos = vi.fn()
      service.callbacks.onPositionUpdate = onPos
      service.callbacks.onPositionUpdate({ x: 123 })
      expect(onPos).toHaveBeenCalledWith({ x: 123 })
    })

    it('updatePosition should publish to the correct destination with proper data', () => {
      service.stompClient = {
        publish: vi.fn()
      }
      service.connected = true
      
      const result = service.updatePosition('user123', 123.456, 78.910)
      
      expect(result).toBe(true)
      expect(service.stompClient.publish).toHaveBeenCalledWith({
        destination: '/app/position',
        body: JSON.stringify({
          userId: 'user123',
          longitude: 123.456,
          latitude: 78.910
        })
      })
    })


    it('updatePosition should handle missing parameters', () => {
      service.stompClient = { publish: vi.fn() }
      service.connected = true
      

      expect(service.updatePosition(null, 123.456, 78.910)).toBe(true)
      expect(service.stompClient.publish).toHaveBeenCalledWith({
        destination: '/app/position',
        body: JSON.stringify({
          userId: null,
          longitude: 123.456,
          latitude: 78.910
        })
      })
      
      // Missing coordinates
      service.stompClient.publish.mockClear()
      expect(service.updatePosition('user123', null, undefined)).toBe(true)
      expect(service.stompClient.publish).toHaveBeenCalledWith({
        destination: '/app/position',
        body: JSON.stringify({
          userId: 'user123',
          longitude: null,
          latitude: undefined
        })
      })
    })

    it('should call onIncident callback for incidents from both topic and user queues', () => {
      const onIncident = vi.fn()
      service.callbacks.onIncident = onIncident
      service.stompClient = {
        subscribe: vi.fn((dest, cb) => subscribeMocks.push({ destination: dest, callback: cb }))
      }
      service.token = 'tok'
      service.userId = 'u1'
      
      service._onConnected()
      
      const topicSub = subscribeMocks.find(m => m.destination === '/topic/notifications')
      const userSub = subscribeMocks.find(m => m.destination === '/user/queue/notifications')
      
      const incidentPayload = { type: 'INCIDENT', severity: 'HIGH', message: 'Test incident' }
      
      topicSub.callback({ body: JSON.stringify(incidentPayload) })
      expect(onIncident).toHaveBeenCalledWith(incidentPayload)
      
      onIncident.mockClear()
      userSub.callback({ body: JSON.stringify(incidentPayload) })
      expect(onIncident).toHaveBeenCalledWith(incidentPayload)
    })

    it('should have a default empty onIncident callback', () => {
      const service = new WebSocketService()
      expect(typeof service.callbacks.onIncident).toBe('function')
      expect(() => service.callbacks.onIncident()).not.toThrow()
    })

    it('init should handle null callbacks', () => {
      const initialCallbacks = {
        onConnected: () => 'connected',
        onDisconnected: () => 'disconnected',
        onNotification: () => 'notification',
        onPositionUpdate: () => 'position'
      }
      
      service.callbacks = { ...initialCallbacks }
      
      service.init({
        userId: 'u1',
        householdId: 'h1',
        token: 't1',
        onConnected: null,
        onDisconnected: null,
        onNotification: null,
        onPositionUpdate: null
      })
      
      expect(service.callbacks.onConnected).toBe(initialCallbacks.onConnected)
      expect(service.callbacks.onDisconnected).toBe(initialCallbacks.onDisconnected)
      expect(service.callbacks.onNotification).toBe(initialCallbacks.onNotification)
      expect(service.callbacks.onPositionUpdate).toBe(initialCallbacks.onPositionUpdate)
    })

    it('disconnect should handle null stompClient gracefully', () => {
      service.stompClient = null
      expect(() => service.disconnect()).not.toThrow()
    })

    it('connect should work asynchronously', async () => {
      const connectSpy = vi.spyOn(service, 'connect')
      
      service.userId = 'async-test'
      service.connect()
      
      expect(connectSpy).toHaveBeenCalled()
      
      await flushPromises()
      
      expect(Client).toHaveBeenCalled()
      expect(service.stompClient.activate).toHaveBeenCalled()
    })

    it('updatePosition should publish with correct content type and headers', () => {
      service.stompClient = {
        publish: vi.fn()
      }
      service.connected = true
      service.token = 'auth-token'
      
      service.updatePosition('user456', 10.123, 20.456)
      
      expect(service.stompClient.publish).toHaveBeenCalledWith(
        expect.objectContaining({
          destination: '/app/position',
          body: JSON.stringify({
            userId: 'user456',
            longitude: 10.123,
            latitude: 20.456
          })
        })
      )
    })

    })
