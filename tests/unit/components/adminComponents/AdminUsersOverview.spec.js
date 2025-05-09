import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AdminUsersOverview from '@/components/adminComponents/AdminUsersOverview.vue'

vi.mock('@/components/householdMainView/modals/ConfirmModal.vue', () => ({
  default: {
    name: 'ConfirmModal',
    template: '<div class="mock-modal" data-testid="confirm-modal"><slot></slot></div>',
    props: ['title', 'description', 'confirmText', 'cancelText']
  }
}))

describe('AdminUsersOverview.vue', () => {
  const mockAdmins = [
    { id: 1, email: 'superadmin@example.com', role: 'SUPERADMIN' },
    { id: 2, email: 'admin@example.com', role: 'ADMIN' }
  ]

  let wrapper

  beforeEach(() => {
    wrapper = mount(AdminUsersOverview, {
      props: {
        admins: mockAdmins,
        isLoading: false
      }
    })
  })

  it('renders admin list correctly', () => {
    const adminRows = wrapper.findAll('.flex.items-center.justify-between')
    expect(adminRows.length).toBe(2)
    expect(adminRows[0].text()).toContain('superadmin@example.com')
    expect(adminRows[1].text()).toContain('admin@example.com')
  })

  it('displays Super Admin label for SUPERADMIN role', () => {
    expect(wrapper.text()).toContain('Super Admin')

    const superAdminRow = wrapper.findAll('.flex.items-center.justify-between')[0]
    expect(superAdminRow.text()).toContain('Super Admin')
  })

  it('displays loading state when isLoading is true', async () => {
    await wrapper.setProps({ isLoading: true })
    expect(wrapper.text()).toContain('Laster administratorer')
    expect(wrapper.find('.text-center.py-4').exists()).toBe(true)
  })

  it('shows action buttons only for regular admins', () => {
    const adminRows = wrapper.findAll('.flex.items-center.justify-between')

    const superAdminButtons = adminRows[0].findAll('button')
    expect(superAdminButtons.length).toBe(0)

    const adminButtons = adminRows[1].findAll('button')
    expect(adminButtons.length).toBe(2)
    expect(adminButtons[0].text()).toContain('Send nytt passord')
    expect(adminButtons[1].text()).toContain('Slett')
  })

  it('opens password reset modal when clicking reset button', async () => {
    const resetButton = wrapper.findAll('button')[0]
    expect(resetButton.text()).toContain('Send nytt passord')

    await resetButton.trigger('click')

    expect(wrapper.vm.showPasswordModal).toBe(true)
    expect(wrapper.vm.adminEmailForPassword).toBe('admin@example.com')

    const modal = wrapper.find('[data-testid="confirm-modal"]')
    expect(modal.exists()).toBe(true)
  })

  it('opens delete modal when clicking delete button', async () => {
    const deleteButton = wrapper.findAll('button')[1]
    expect(deleteButton.text()).toContain('Slett')

    await deleteButton.trigger('click')

    expect(wrapper.vm.showDeleteModal).toBe(true)
    expect(wrapper.vm.adminToDelete).toEqual(mockAdmins[1])

    const modal = wrapper.find('[data-testid="confirm-modal"]')
    expect(modal.exists()).toBe(true)
  })

  it('emits reset-password event when confirming password reset', async () => {
    wrapper.vm.openPasswordModal('admin@example.com')

    await wrapper.vm.confirmPasswordReset()
    await flushPromises()

    const emitted = wrapper.emitted('reset-password')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toBe('admin@example.com')

    expect(wrapper.vm.showPasswordModal).toBe(false)

    expect(wrapper.vm.successfulResets['admin@example.com']).toBe(true)
  })

  it('emits delete-admin event when confirming deletion', async () => {
    wrapper.vm.openPasswordModal('admin@example.com')

    const admin = mockAdmins[1]
    wrapper.vm.openDeleteModal(admin)

    await wrapper.vm.confirmDelete()
    await flushPromises()

    const emitted = wrapper.emitted('delete-admin')
    expect(emitted).toBeTruthy()
    expect(emitted[0][0]).toEqual(admin)

    expect(wrapper.vm.showDeleteModal).toBe(false)
    expect(wrapper.vm.adminToDelete).toBe(null)
  })

  it('cancels password reset operation when cancel is clicked', async () => {
    wrapper.vm.openPasswordModal('admin@example.com')
    expect(wrapper.vm.showPasswordModal).toBe(true)

    wrapper.vm.cancelPasswordReset()

    expect(wrapper.vm.showPasswordModal).toBe(false)
    expect(wrapper.vm.adminEmailForPassword).toBe('')
  })

  it('cancels delete operation when cancel is clicked', async () => {
    const admin = mockAdmins[1]
    wrapper.vm.openDeleteModal(admin)
    expect(wrapper.vm.showDeleteModal).toBe(true)

    wrapper.vm.cancelDelete()

    expect(wrapper.vm.showDeleteModal).toBe(false)
    expect(wrapper.vm.adminToDelete).toBe(null)
  })

  it('shows "Sendt" text after password reset', async () => {
    wrapper.vm.successfulResets['admin@example.com'] = true
    await wrapper.vm.$nextTick()

    const sentButton = wrapper.find('button[disabled]')
    expect(sentButton.exists()).toBe(true)
    expect(sentButton.text()).toBe('Sendt')
  })

  it('markResetFailed method clears successful reset state', async () => {
    wrapper.vm.successfulResets['admin@example.com'] = true

    wrapper.vm.markResetFailed('admin@example.com')

    expect(wrapper.vm.successfulResets['admin@example.com']).toBe(false)
  })

  it('does not show modals by default', () => {
    expect(wrapper.vm.showPasswordModal).toBe(false)
    expect(wrapper.vm.showDeleteModal).toBe(false)

    const modals = wrapper.findAll('[data-testid="confirm-modal"]')
    expect(modals.length).toBe(0)
  })
})
