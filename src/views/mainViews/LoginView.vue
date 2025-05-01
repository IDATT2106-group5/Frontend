  <script setup>
  import { ref } from "vue"
  import { Mail, Lock, Eye, EyeOff } from "lucide-vue-next"
  import { Button } from "@/components/ui/button"
  import { Input } from "@/components/ui/input"
  import { useUserStore } from "@/stores/UserStore"
  import { useRouter } from "vue-router"


  const showPassword = ref(false)
  const userStore = useUserStore()
  const router = useRouter()

  async function onSubmit(event) {
  event.preventDefault()
  const formData = new FormData(event.target)
  const credentials = {
    email: formData.get("email"),
    password: formData.get("password"),
    }

    try {
      const resp = await userStore.login(credentials)

      if (resp) {
        router.push("/")
      }
    }   catch (error) {
      console.error("Login failed:", error)
    }
  }
  </script>

  <template>
    <main class="flex flex-col items-center justify-center min-h-screen p-4 space-y-3">
      <img src="/src/assets/icons/Krisefikser.png" alt="Krisefikser Logo" class="w-60 mb-4" />
      <h1 class="text-3xl font-bold">Login</h1>

      <form @submit="onSubmit" class="w-full max-w-sm space-y-4">
        <div class="relative">
          <Mail class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            class="pl-10"
            name="email"
            type="email"
            placeholder="Epost"
            required
          />
        </div>

        <div class="relative">
          <Lock class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <Input
            class="pl-10 pr-10"
            :type="showPassword ? 'text' : 'password'"
            name="password"
            placeholder="Passord"
            required
          />
          <button
            type="button"
            @click="showPassword = !showPassword"
            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
          >
            <component :is="showPassword ? EyeOff : Eye" />
          </button>
        </div>

        <div class="flex justify-between gap-2">
          <Button type="submit" class="w-1/2 bg-black text-white">Login</Button>
          <RouterLink
            to="/register"
            class="w-1/2 text-center border bg-white text-black hover:bg-gray-300 px-4 py-2 rounded"
          >
            Registrer
          </RouterLink>
        </div>

        <div class="flex items-center justify-between text-sm">
          <label class="flex items-center gap-2">
            <input type="checkbox" class="accent-black" />
            Husk meg
          </label>
          <a href="#" class="text-gray-800 hover:underline">Glemt passord?</a>
        </div>
      </form>
    </main>
  </template>
