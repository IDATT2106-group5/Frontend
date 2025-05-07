import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useHouseholdStore } from '@/stores/HouseholdStore'

export default function useHousehold() {
  const router = useRouter()
  const householdStore = useHouseholdStore()

  // Use store's reactive state directly
  const isLoading = computed(() => householdStore.isLoading)
  const error = computed(() => householdStore.error)
  const hasHousehold = computed(() => householdStore.hasHousehold)
  const householdName = computed(() => householdStore.currentHousehold?.name || '')
  const householdAddress = computed(() => householdStore.currentHousehold?.address || '')
  const householdId = computed(() => householdStore.currentHousehold?.id || '')
  const isOwner = computed(() => householdStore.isCurrentUserOwner)

  // UI control states
  const showAddForm = ref(false)
  const showInviteForm = ref(false)
  const showEditForm = ref(false)

  // Load household data on mount
  onMounted(() => {
    householdStore.loadHouseholdData()
  })

  // UI control methods
  const openAddMemberForm = () => { showAddForm.value = true }
  const openInviteForm = () => { showInviteForm.value = true }
  const openEditHouseholdForm = () => { showEditForm.value = true }


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
    openEditHouseholdForm
  }
}
