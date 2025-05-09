<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScenarioStore } from '@/stores/ScenarioStore.js'
import {
  AlertTriangle, AlertOctagon, Droplets, Flame, Wind, Thermometer, Zap, ShieldAlert, Trash2, Bomb,
  Waves, Car, ThermometerSun, Nfc, CloudDrizzle, FlashlightOff, Footprints, Snowflake, Swords,
  MountainSnow, CloudLightning, FlaskRound, LightbulbOff, FlaskConical, Syringe, Atom, DropletOff,
} from 'lucide-vue-next'
import { toast } from '@/components/ui/toast/index.js'

export default {
  name: 'ScenarioView',
  components: {
    AlertTriangle, AlertOctagon, Droplets, Flame, Wind, Thermometer, Zap, ShieldAlert, Trash2, Bomb,
    Waves, Car, ThermometerSun, Nfc, CloudDrizzle, FlashlightOff, Footprints, Snowflake, Swords,
    MountainSnow, CloudLightning, FlaskRound, LightbulbOff, FlaskConical, Syringe, Atom, DropletOff,
  },

  /**
   * @function setup
   * @description Vue Composition API setup function that handles component logic
   * @returns {Object} Reactive properties and methods for the component template
   */
  setup() {
    const route = useRoute()
    const router = useRouter()
    const scenarioStore = useScenarioStore()

    const loading = ref(false)
    const error = ref(null)

    /**
     * @constant {Array} availableIcons
     * @description List of icon components that can be used for scenarios
     * Each icon has a name property and the actual component reference
     */
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
      { name: 'Waves', component: Waves },
      { name: 'Car', component: Car },
      { name: 'ThermometerSun', component: ThermometerSun },
      { name: 'Nfc', component: Nfc },
      { name: 'CloudDrizzle', component: CloudDrizzle },
      { name: 'FlashlightOff', component: FlashlightOff },
      { name: 'Footprints', component: Footprints },
      { name: 'Snowflake', component: Snowflake },
      { name: 'Swords', component: Swords },
      { name: 'MountainSnow', component: MountainSnow },
      { name: 'CloudLightning', component: CloudLightning },
      { name: 'FlaskRound', component: FlaskRound },
      { name: 'LightbulbOff', component: LightbulbOff },
      { name: 'FlaskConical', component: FlaskConical },
      { name: 'Syringe', component: Syringe },
      { name: 'Atom', component: Atom },
      { name: 'DropletOff', component: DropletOff },
    ]

    /**
     * @computed scenarioId
     * @description Extracts and parses the scenario ID from the route parameters
     * @returns {Number|null} The parsed scenario ID or null if not present
     */
    const scenarioId = computed(() => {
      return route.params.id ? parseInt(route.params.id) : null
    })

    /**
     * @computed isEditing
     * @description Determines if the component is in edit mode based on presence of ID
     * @returns {Boolean} True if editing an existing scenario, false if creating new
     */
    const isEditing = computed(() => {
      return scenarioId.value !== null
    })

    /**
     * @constant {Object} scenarioForm
     * @description Reactive form data for the scenario being created or edited
     * @property {String} name - The name of the scenario
     * @property {String} description - Detailed description of the scenario
     * @property {String} toDo - Action items or steps to take in this scenario
     * @property {String} packingList - Items to prepare or pack for this scenario
     * @property {String} iconName - Name of the selected icon for visual representation
     */
    const scenarioForm = ref({
      name: '',
      description: '',
      toDo: '',
      packingList: '',
      iconName: 'AlertTriangle',
    })

    /**
     * @function onMounted
     * @description Lifecycle hook that loads scenario data if in edit mode
     * Fetches the selected scenario's details from the store based on ID
     */
    onMounted(async () => {
      if (isEditing.value) {
        loading.value = true
        try {
          if (scenarioStore.getAllScenarios.length === 0) {
            await scenarioStore.fetchAllScenarios()
          }

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

    /**
     * @function selectIcon
     * @description Updates the selected icon in the form
     * @param {String} iconName - Name of the icon to select
     */
    const selectIcon = (iconName) => {
      scenarioForm.value.iconName = iconName
    }

    /**
     * @function saveScenario
     * @description Saves or updates the scenario based on edit mode
     * Creates a new scenario or updates an existing one in the store
     * Shows appropriate toast notifications and redirects to admin page
     */
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
        } else {
          await scenarioStore.createScenario(scenarioData)
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

    /**
     * @function goBack
     * @description Navigates back to the scenarios admin list
     * Cancels the current edit/create operation
     */
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
        <div class="grid grid-cols-5 gap-4 mt-2">
          <div
            v-for="icon in availableIcons"
            :key="icon.name"
            :class="[
              'flex flex-col items-center justify-center',
              'border rounded-md cursor-pointer transition-all duration-200',
              'h-24 w-24',
              scenarioForm.iconName === icon.name
                ? 'bg-blue-50 border-blue-500'
                : 'border-gray-200 hover:bg-gray-50'
            ]"
            @click="selectIcon(icon.name)"
          >
            <div class="flex items-center justify-center h-12 w-12">
              <component :is="icon.component" size="32" />
            </div>
            <span class="text-xs mt-2 text-center">{{ icon.name }}</span>
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