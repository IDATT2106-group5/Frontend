<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useScenarioStore } from '@/stores/ScenarioStore'
// Import Lucide icons
import {
  AlertTriangle, AlertOctagon, Droplets, Flame, Wind,
  Thermometer, Zap, ShieldAlert, Trash2
} from 'lucide-vue-next'

export default {
  name: 'ScenarioView',
  components: {
    Trash2
  },

  setup() {
    const route = useRoute()
    const router = useRouter()
    const scenarioStore = useScenarioStore()

    const loading = ref(false)
    const error = ref(null)
    const showDeleteModal = ref(false)

    // Available icons from Lucide
    const availableIcons = [
      { name: 'AlertTriangle', component: AlertTriangle },
      { name: 'AlertOctagon', component: AlertOctagon },
      { name: 'Droplets', component: Droplets },
      { name: 'Flame', component: Flame },
      { name: 'Wind', component: Wind },
      { name: 'Thermometer', component: Thermometer },
      { name: 'Virus', component: Virus },
      { name: 'Zap', component: Zap },
      { name: 'ShieldAlert', component: ShieldAlert }
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
      actions: '',
      checklist: '',
      icon: 'AlertTriangle'
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
              actions: selectedScenario.actions || '',
              checklist: selectedScenario.checklist || '',
              icon: selectedScenario.icon || 'AlertTriangle'
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
      scenarioForm.value.icon = iconName
    }

    // Save or update scenario
    const saveScenario = async () => {
      loading.value = true
      error.value = null

      try {
        const scenarioData = {
          name: scenarioForm.value.name,
          description: scenarioForm.value.description,
          actions: scenarioForm.value.actions,
          checklist: scenarioForm.value.checklist,
          icon: scenarioForm.value.icon
        }

        if (isEditing.value) {
          await scenarioStore.updateScenario(scenarioId.value, scenarioData)
        } else {
          await scenarioStore.createScenario(scenarioData)
        }

        // Redirect back to scenarios list
        router.push('/scenarios')
      } catch (err) {
        error.value = err.message || 'Feil ved lagring av scenario'
        loading.value = false
      }
    }

    // Navigate back to scenarios list
    const goBack = () => {
      router.push('/scenarios')
    }

    // Show delete confirmation modal
    const confirmDelete = () => {
      showDeleteModal.value = true
    }

    // Delete scenario
    const deleteScenario = async () => {
      loading.value = true
      try {
        await scenarioStore.deleteScenario(scenarioId.value)
        router.push('/scenarios')
      } catch (err) {
        error.value = err.message || 'Feil ved sletting av scenario'
        loading.value = false
        showDeleteModal.value = false
      }
    }

    return {
      loading,
      error,
      scenarioForm,
      isEditing,
      availableIcons,
      showDeleteModal,
      saveScenario,
      goBack,
      selectIcon,
      confirmDelete,
      deleteScenario
    }
  }
}
</script>

<template>
  <div class="scenario-view">
    <h1 class="page-title">{{ isEditing ? 'Rediger scenario' : 'Legg til nytt scenario' }}</h1>

    <div v-if="loading" class="loading">
      <p>Laster...</p>
    </div>

    <div v-else-if="error" class="error">
      <p>Det oppstod en feil: {{ error }}</p>
      <button @click="goBack" class="primary-button">Tilbake</button>
    </div>

    <form v-else @submit.prevent="saveScenario" class="scenario-form">
      <div class="form-group">
        <label for="name">Tittel på scenario</label>
        <input
          id="name"
          v-model="scenarioForm.name"
          type="text"
          required
          placeholder="Skriv inn scenarionavn"
        />
      </div>

      <div class="form-group">
        <label>Om dette scenarioet</label>
        <textarea
          v-model="scenarioForm.description"
          rows="6"
          required
          placeholder="Beskriv scenarioet"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Hva du bør gjøre</label>
        <textarea
          v-model="scenarioForm.actions"
          rows="6"
          required
          placeholder="• Punkt 1&#10;• Punkt 2&#10;• Punkt 3&#10;• Punkt 4&#10;• Punkt 5"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Pakkeliste</label>
        <textarea
          v-model="scenarioForm.checklist"
          rows="6"
          required
          placeholder="• Punkt 1&#10;• Punkt 2&#10;• Punkt 3&#10;• Punkt 4&#10;• Punkt 5"
        ></textarea>
      </div>

      <div class="form-group">
        <label>Velg ikon</label>
        <div class="icon-selector">
          <div
            v-for="icon in availableIcons"
            :key="icon.name"
            :class="['icon-option', { 'selected': scenarioForm.icon === icon.name }]"
            @click="selectIcon(icon.name)"
          >
            <component :is="icon.component" size="24" />
            <span>{{ icon.name }}</span>
          </div>
        </div>
      </div>

      <div class="form-actions">
        <button type="button" @click="goBack" class="secondary-button">Avbryt</button>
        <button
          v-if="isEditing"
          type="button"
          @click="confirmDelete"
          class="delete-button"
        >
          <Trash2 size="16" />
          Slett
        </button>
        <button type="submit" class="primary-button">Lagre</button>
      </div>
    </form>

    <!-- Delete confirmation modal -->
    <div v-if="showDeleteModal" class="modal-overlay">
      <div class="modal">
        <h3>Bekreft sletting</h3>
        <p>Er du sikker på at du vil slette "{{ scenarioForm.name }}"?</p>
        <div class="modal-actions">
          <button @click="showDeleteModal = false" class="secondary-button">Avbryt</button>
          <button @click="deleteScenario" class="delete-button">Slett</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.scenario-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.page-title {
  margin-bottom: 30px;
  font-size: 24px;
  color: #333;
}

.loading, .error {
  text-align: center;
  padding: 40px 0;
}

.error {
  color: #d32f2f;
}

.scenario-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

input[type="text"], textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 16px;
}

.icon-selector {
  display: flex;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 10px;
}

.icon-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 10px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
}

.icon-option.selected {
  background-color: #e3f2fd;
  border-color: #2196f3;
}

.icon-option span {
  margin-top: 5px;
  font-size: 12px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}

.primary-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.secondary-button {
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ccc;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
}

.delete-button {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 12px 20px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;
}

.primary-button:hover {
  background-color: #45a049;
}

.secondary-button:hover {
  background-color: #e0e0e0;
}

.delete-button:hover {
  background-color: #d32f2f;
}

/* Modal styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background-color: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 100%;
}

.modal h3 {
  margin-top: 0;
  margin-bottom: 15px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 15px;
  margin-top: 30px;
}
</style>