import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/mainViews/HomeView.vue'
import LoginView from '../views/mainViews/LoginView.vue'
import RegisterView from '../views/mainViews/RegisterView.vue'
import HouseholdView from '@/views/householdViews/HouseholdView.vue'
import StorageDetailView from '@/views/storageViews/StorageDetailView.vue'
import VerifyEmailView from '@/views/mainViews/VerifyEmailView.vue'
import RegisterSuccessView from '@/views/mainViews/RegisterSucessView.vue'
import RegisterFailedView from '@/views/mainViews/RegisterFailedView.vue'
import Admin2FaView from '@/views/adminViews/Admin2FaView.vue'
import MapView from '@/views/mapView/MapView.vue'

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
    {
      path: '/verify-email',
      name: 'VerifyEmail',
      component: VerifyEmailView
    },
    {
      path: '/register-success',
      name: 'RegisterSuccess',
      component: RegisterSuccessView,
      meta:{hideNavbar: true },
    },
    {
      path: '/register-failed',
      name: 'RegisterFailed',
      component: RegisterFailedView,
      meta:{hideNavbar: true },
    },
    {
      path: '/2FA',
      name: '2FA',
      component: Admin2FaView,
      props: (route) => ({ email: route.query.email || 'test' }),
      meta:{hideNavbar: true },
    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
    }
  ],
})

export default router
