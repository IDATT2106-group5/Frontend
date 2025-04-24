import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/mainViews/HomeView.vue'
import LoginView from '../views/mainViews/LoginView.vue'
import RegisterView from '../views/mainViews/RegisterView.vue'

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
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
    },
  ],
})

export default router
