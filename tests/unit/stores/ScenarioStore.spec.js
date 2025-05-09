import { setActivePinia, createPinia } from 'pinia'
import { useScenarioStore } from '@/stores/ScenarioStore'
import ScenarioService from '@/service/scenarioService'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@/service/scenarioService', () => ({
  default: {
    getAllScenarios: vi.fn(),
    getScenarioById: vi.fn(),
    createScenario: vi.fn(),
    updateScenario: vi.fn(),
  },
}))

describe('ScenarioStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useScenarioStore()
  })

  it('fetchAllScenarios - success', async () => {
    ScenarioService.getAllScenarios.mockResolvedValueOnce([{ id: 1 }])
    await store.fetchAllScenarios()
    expect(store.scenarios).toEqual([{ id: 1 }])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('fetchAllScenarios - failure', async () => {
    const err = new Error('fail')
    ScenarioService.getAllScenarios.mockRejectedValueOnce(err)
    await store.fetchAllScenarios()
    expect(store.error).toBe(err)
    expect(store.loading).toBe(false)
  })

  it('fetchScenarioById - success', async () => {
    const scenario = { id: 2, name: 'Test Scenario' }
    ScenarioService.getScenarioById.mockResolvedValueOnce(scenario)
    const result = await store.fetchScenarioById(2)
    expect(result).toEqual(scenario)
    expect(store.selectedScenario).toEqual(scenario)
  })

  it('fetchScenarioById - failure', async () => {
    const err = new Error('not found')
    ScenarioService.getScenarioById.mockRejectedValueOnce(err)
    await expect(store.fetchScenarioById(2)).rejects.toThrow('not found')
    expect(store.error).toBe(err)
    expect(store.selectedScenario).toBeNull()
  })

  it('selectScenario - finds scenario by id', () => {
    store.scenarios = [{ id: 1 }, { id: 2 }]
    store.selectScenario(2)
    expect(store.selectedScenario).toEqual({ id: 2 })
  })

  it('selectScenario - sets null if id not found', () => {
    store.scenarios = [{ id: 1 }]
    store.selectScenario(99)
    expect(store.selectedScenario).toBeNull()
  })

  it('createScenario - success', async () => {
    ScenarioService.createScenario.mockResolvedValueOnce({ id: 3 })
    ScenarioService.getAllScenarios.mockResolvedValueOnce([{ id: 3 }])
    const result = await store.createScenario({ name: 'New' })
    expect(result).toEqual({ id: 3 })
    expect(store.scenarios).toEqual([{ id: 3 }])
  })

  it('createScenario - failure', async () => {
    const err = new Error('create failed')
    ScenarioService.createScenario.mockRejectedValueOnce(err)
    await expect(store.createScenario({})).rejects.toThrow('create failed')
    expect(store.error).toBe(err)
  })

  it('updateScenario - success and reselects if selected', async () => {
    store.selectedScenario = { id: 5 }
    store.scenarios = [{ id: 5, name: 'Old' }]
    ScenarioService.updateScenario.mockResolvedValueOnce({ id: 5 })
    ScenarioService.getAllScenarios.mockResolvedValueOnce([{ id: 5, name: 'Updated' }])
    const result = await store.updateScenario(5, { name: 'Updated' })
    expect(result).toEqual({ id: 5 })
    expect(store.selectedScenario).toEqual({ id: 5, name: 'Updated' })
  })

  it('updateScenario - failure', async () => {
    const err = new Error('update failed')
    ScenarioService.updateScenario.mockRejectedValueOnce(err)
    await expect(store.updateScenario(1, {})).rejects.toThrow('update failed')
    expect(store.error).toBe(err)
  })

  it('resetState clears state', () => {
    store.scenarios = [{ id: 1 }]
    store.loading = true
    store.error = 'Error'
    store.selectedScenario = { id: 1 }
    store.resetState()
    expect(store.scenarios).toEqual([])
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
    expect(store.selectedScenario).toBeNull()
  })
  it('getter: getAllScenarios returns all scenarios', () => {
    store.scenarios = [{ id: 1 }, { id: 2 }]
    expect(store.getAllScenarios).toEqual([{ id: 1 }, { id: 2 }])
  })
  
  it('getter: getSelectedScenario returns selected scenario', () => {
    store.selectedScenario = { id: 3 }
    expect(store.getSelectedScenario).toEqual({ id: 3 })
  })
  
  it('getter: isLoading returns loading state', () => {
    store.loading = true
    expect(store.isLoading).toBe(true)
  })
  
  it('getter: getError returns error state', () => {
    store.error = new Error('something went wrong')
    expect(store.getError.message).toBe('something went wrong')
  })
  
})
