import { setActivePinia, createPinia } from 'pinia'
import { useAdminStore } from '@/stores/AdminStore'
import { vi, describe, it, beforeEach, expect } from 'vitest'
import { useUserStore } from '@/stores/UserStore'
import AdminService from '@/service/adminService'
import RegisterAdminService from '@/service/admin/registerAdminService'
import IncidentAdminService from '@/service/admin/incidentAdminService'

vi.mock('@/stores/UserStore', () => ({
  useUserStore: vi.fn()
}))

vi.mock('@/service/adminService', () => ({
  default: {
    getAllAdmins: vi.fn(),
    resetPassword: vi.fn(),
    deleteAdmin: vi.fn()
  }
}))

vi.mock('@/service/admin/registerAdminService', () => ({
  default: {
    inviteAdmin: vi.fn()
  }
}))

vi.mock('@/service/admin/incidentAdminService', () => ({
  default: {
    fetchAllIncidentsForAdmin: vi.fn()
  }
}))

describe('AdminStore', () => {
  let store

  beforeEach(() => {
    setActivePinia(createPinia())
    store = useAdminStore()
  })

  it('fetchAdmins - does not run if not superadmin', async () => {
    useUserStore.mockReturnValue({ isSuperAdmin: false })
    await store.fetchAdmins()
    expect(store.admins).toEqual([])
  })

  it('fetchAdmins - fetches and sorts admins', async () => {
    useUserStore.mockReturnValue({ isSuperAdmin: true })
    AdminService.getAllAdmins.mockResolvedValue([
      { email: 'b@b.com', role: 'ADMIN' },
      { email: 'a@a.com', role: 'SUPERADMIN' }
    ])
    await store.fetchAdmins()
    expect(store.admins[0].role).toBe('SUPERADMIN')
    expect(store.admins[1].email).toBe('b@b.com')
  })

  it('fetchIncidents - does not run if not admin', async () => {
    useUserStore.mockReturnValue({ isAdmin: false })
    await store.fetchIncidents()
    expect(store.incidents).toEqual([])
  })

  it('fetchIncidents - loads incidents', async () => {
    useUserStore.mockReturnValue({ isAdmin: true })
    IncidentAdminService.fetchAllIncidentsForAdmin.mockResolvedValue([{ id: 1 }])
    await store.fetchIncidents()
    expect(store.incidents).toEqual([{ id: 1 }])
  })

  it('inviteNewAdmin - returns response', async () => {
    const response = { success: true }
    RegisterAdminService.inviteAdmin.mockResolvedValue(response)
    const result = await store.inviteNewAdmin({ email: 'test@test.com' })
    expect(result).toEqual(response)
  })

  it('resetPasswordAdmin - returns response', async () => {
    const response = { status: 'ok' }
    AdminService.resetPassword.mockResolvedValue(response)
    const result = await store.resetPasswordAdmin('admin@example.com')
    expect(result).toEqual(response)
  })

  it('deleteAdmin - returns response', async () => {
    const response = { deleted: true }
    AdminService.deleteAdmin.mockResolvedValue(response)
    const result = await store.deleteAdmin('admin123')
    expect(result).toEqual(response)
  })
})
