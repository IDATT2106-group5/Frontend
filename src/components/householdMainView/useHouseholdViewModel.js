import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/HouseholdStore'

export default function useHousehold() {
  const router = useRouter()
  const householdStore = useHouseholdStore()

  const isLoading = computed(() => householdStore.isLoading)
  const error = computed(() => householdStore.error)
  const hasHousehold = computed(() => householdStore.hasHousehold)
  const householdName = computed(() => householdStore.currentHousehold?.name || '')
  const householdAddress = computed(() => householdStore.currentHousehold?.address || '')
  const householdId = computed(() => householdStore.currentHousehold?.id || '')
  const isOwner = computed(() => householdStore.isCurrentUserOwner)

  const showAddForm = ref(false)
  const showInviteForm = ref(false)
  const showEditForm = ref(false)

  /** Load household data when the component mounts */
  onMounted(() => {
    householdStore.loadHouseholdData()
  })

  /** Open the form to add a new member */
  const openAddMemberForm = () => { showAddForm.value = true }

  /** Open the form to invite someone by email */
  const openInviteForm = () => { showInviteForm.value = true }

  /** Open the form to edit household name or address */
  const openEditHouseholdForm = () => { showEditForm.value = true }

  
  /**
   * Deletes the current household and reloads state
   * (should only be available to owners)
   */
  const deleteHousehold = async () => {
    try {
      await householdStore.deleteHousehold()
      await householdStore.loadHouseholdData()
    } catch (e) {
      console.error('Feil ved sletting av husstand:', e)
    }
  }
  
  /**
   * Removes the current user from the household
   */
  const leaveHousehold = async () => {
    try {
      await householdStore.leaveHousehold()
      await householdStore.loadHouseholdData()
    } catch (e) {
      console.error('Feil ved å forlate husstand:', e)
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
