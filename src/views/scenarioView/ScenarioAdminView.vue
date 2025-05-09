<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScenarioStore } from '@/stores/ScenarioStore.js'
import {
  AlertTriangle, AlertOctagon, Droplets, Flame, Wind,
  Thermometer, Zap, ShieldAlert, Trash2, Bomb, Waves
} from 'lucide-vue-next'
import { toast } from '@/components/ui/toast/index.js'

export default {
  name: 'ScenarioView',
  components: {
    AlertTriangle,
    AlertOctagon,
    Droplets,
    Flame,
    Wind,
    Thermometer,
    Zap,
    ShieldAlert,
    Trash2,
    Bomb,
    Waves
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const scenarioStore = useScenarioStore()

    const loading = ref(false)
    const error = ref(null)

    // Available icons from Lucide
    const availableIcons = [
      { name: 'AlertTriangle', component: AlertTriangle },
      { name: 'AlertOctagon', component: AlertOctagon },
      { name: 'Droplets', component: Droplets },
      { name: 'Flame', component: Flame },
      { name: 'Wind', component: Wind },
      { name: 'Thermometer', component: Thermometer },
      { name: 'Zap', component: Zap },
      { name: 'ShieldAlert', component: ShieldAlert },
      { name: 'Bomb', component: Bomb },
      { name: 'Wave', component: Waves },
    ]

    const scenarioId = computed(() => {
      return route.params.id ? parseInt(route.params.id) : null
    })

    const isEditing = computed(() => {
      return scenarioId.value !== null
    })

    const scenarioForm = ref({
      name: '',
      description: '',
      toDo: '',
      packingList: '',
      iconName: 'AlertTriangle',
    })

    // Load scenario data if editing
    onMounted(async () => {
      if (isEditing.value) {
        loading.value = true
        try {
          // Make sure scenarios are loaded
          if (scenarioStore.getAllScenarios.length === 0) {
            await scenarioStore.fetchAllScenarios()
          }

          // Get the specific scenario we're editing
          scenarioStore.selectScenario(scenarioId.value)
          const selectedScenario = scenarioStore.getSelectedScenario

          if (selectedScenario) {
            scenarioForm.value = {
              name: selectedScenario.name,
              description: selectedScenario.description,
              toDo: selectedScenario.toDo || '',
              packingList: selectedScenario.packingList || '',
              iconName: selectedScenario.iconName || 'AlertTriangle'
            }
          } else {
            error.value = 'Scenario ikke funnet'
          }
        } catch (err) {
          error.value = err.message || 'Feil ved lasting av scenario'
        } finally {
          loading.value = false
        }
      }
    })

    const selectIcon = (iconName) => {
      scenarioForm.value.iconName = iconName
    }

    // Save or update scenario
    const saveScenario = async () => {
      loading.value = true
      error.value = null

        const scenarioData = {
          name: scenarioForm.value.name,
          description: scenarioForm.value.description,
          toDo: scenarioForm.value.toDo,
          packingList: scenarioForm.value.packingList,
          iconName: scenarioForm.value.iconName
        }

        try {
          if (isEditing.value) {
          await scenarioStore.updateScenario(scenarioId.value, scenarioData)
            toast({
              title: 'Scenario ble oppdatert',
              description: 'Du har oppdatert et scenario.',
              variant: 'success',
            })
          } else { await scenarioStore.createScenario(scenarioData)
            toast({
              title: 'Scenario ble opprettet',
              description: 'Du har opprettet en scenario.',
              variant: 'success',
            })
          }
        } catch (error) {
          console.error('Failed to update or create scenario:', error)
          router.push('/admin-scenarios')
          toast({
            title: 'Feil',
            description: 'Klarte ikke å oppdatere eller lage scenario.',
            variant: 'destructive',
          })
        }
        router.push('/admin-scenarios')
        loading.value = false
    }

    // Navigate back to scenarios list
    const goBack = () => {
      router.push('/admin-scenarios')
    }

    return {
      loading,
      error,
      scenarioForm,
      isEditing,
      availableIcons,
      saveScenario,
      goBack,
      selectIcon,
    }
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto px-4 py-6">
    <h1 class="text-4xl font-bold text-black mb-6">{{ isEditing ? 'Rediger scenario' : 'Legg til nytt scenario' }}</h1>

    <div v-if="loading" class="text-center py-6">
      <p>Laster...</p>
    </div>

    <div v-else-if="error" class="text-center py-6 text-red-600">
      <p>Det oppstod en feil: {{ error }}</p>
      <button @click="goBack" class="mt-3 bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded">Tilbake</button>
    </div>

    <form v-else @submit.prevent="saveScenario" class="bg-white p-6 rounded-lg shadow-md">
      <div class="mb-4">
        <label for="name" class="block mb-1 font-medium">Tittel på scenario</label>
        <input
          id="name"
          v-model="scenarioForm.name"
          type="text"
          required
          placeholder="Skriv inn scenarionavn"
          class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        />
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Om dette scenarioet</label>
        <textarea
          v-model="scenarioForm.description"
          rows="4"
          placeholder="Beskriv scenarioet"
          class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Hva du bør gjøre</label>
        <textarea
          v-model="scenarioForm.toDo"
          rows="4"
          class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Pakkeliste</label>
        <textarea
          v-model="scenarioForm.packingList"
          rows="4"
          class="w-full p-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
        ></textarea>
      </div>

      <div class="mb-4">
        <label class="block mb-1 font-medium">Velg ikon</label>
        <div class="flex flex-wrap gap-2 mt-2">
          <div
            v-for="icon in availableIcons"
            :key="icon.name"
            :class="['flex flex-col items-center p-2 border rounded cursor-pointer transition-all duration-200',
                    scenarioForm.iconName === icon.name ? 'bg-blue-50 border-blue-500' : 'border-gray-200 hover:bg-gray-50']"
            @click="selectIcon(icon.name)"
          >
            <component :is="icon.component" size="20" />
            <span class="mt-1 text-xs">{{ icon.name }}</span>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-2 mt-5">
        <button type="button" @click="goBack" class="bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2 px-3 rounded border border-gray-300 text-sm">Avbryt</button>
        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-3 rounded text-sm">Lagre</button>
      </div>
    </form>

  </div>
</template>