// Component responsible for the logic for handling household-related actions and state management
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/HouseholdStore'

export default function useHousehold() {
  const router = useRouter()
  const householdStore = useHouseholdStore()

  const isLoading = ref(true)
  const error = ref('')
  const hasHousehold = ref(false)

  const showAddForm = ref(false)
  const showInviteForm = ref(false)
  const showEditForm = ref(false)

  const householdName = computed(() => householdStore.currentHousehold?.name || '')
  const householdAddress = computed(() => householdStore.currentHousehold?.address || '')
  const householdId = computed(() => householdStore.currentHousehold?.id || '')
  const isOwner = computed(() => householdStore.isCurrentUserOwner)

  onMounted(async () => {
    try {
      const ok = await householdStore.checkCurrentHousehold()
      hasHousehold.value = !!ok

      if (ok) {
        await Promise.all([
          householdStore.fetchSentInvitations(),
          householdStore.fetchJoinRequests()
        ])
      }
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    } finally {
      isLoading.value = false
    }
  })

  const openAddMemberForm = () => { showAddForm.value = true }
  const openInviteForm = () => { showInviteForm.value = true }
  const openEditHouseholdForm = () => { showEditForm.value = true }

  const deleteHousehold = async () => {
    if (!confirm('Er du sikker på at du vil slette husstanden? Dette kan ikke angres.')) return
    try {
      await householdStore.deleteHousehold()
      router.push('/household/create')
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  const leaveHousehold = async () => {
    if (!confirm('Er du sikker på at du vil forlate husstanden?')) return
    try {
      await householdStore.leaveHousehold()
      alert('Du har forlatt husstanden')
      router.push('/household/join')
    } catch (e) {
      error.value = e instanceof Error ? e.message : String(e)
    }
  }

  return {
    isLoading,
    error,
    hasHousehold,
    householdName,
    householdAddress,
    householdId,
    isOwner,
    showAddForm,
    showInviteForm,
    showEditForm,
    openAddMemberForm,
    openInviteForm,
    openEditHouseholdForm,
    deleteHousehold,
    leaveHousehold
  }
}
