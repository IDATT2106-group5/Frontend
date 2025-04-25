import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/mainViews/HomeView.vue'
import LoginView from '../views/mainViews/LoginView.vue'
import RegisterView from '../views/mainViews/RegisterView.vue'
import HouseholdView from '@/views/householdViews/HouseholdView.vue'
import StorageDetailView from '@/views/storageViews/StorageDetailView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta:{hideNavbar: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta:{hideNavbar: true },
    },
    {
      path: '/storage-detail',
      name: 'storage detail',
      component: StorageDetailView,
    },
    {
      path: '/household',
      name: 'household',
      component: HouseholdView,
    },
  ],
})

export default router
