import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/UserStore'

import HomeView from '../views/mainViews/HomeView.vue'
import LoginView from '../views/login/LoginView.vue'
import RegisterView from '../views/mainViews/RegisterView.vue'
import HouseholdView from '@/views/householdViews/HouseholdView.vue'
import StorageDetailView from '@/views/storageViews/StorageDetailView.vue'
import VerifyEmailView from '@/views/mainViews/VerifyEmailView.vue'
import RegisterSuccessView from '@/views/mainViews/RegisterSucessView.vue'
import RegisterFailedView from '@/views/mainViews/RegisterFailedView.vue'
import HouseholdInviteView from '@/views/householdViews/HouseholdInviteView.vue'
import StorageView from '@/views/storageViews/StorageView.vue'
import HouseholdCreateView from '@/views/householdViews/HouseholdCreateView.vue'
import HouseholdJoinView from '@/views/householdViews/HouseholdJoinView.vue'
import Admin2FAView from '@/views/adminViews/Admin2FAView.vue'
import BeforeView from '@/views/informationViews/BeforeView.vue'
import UnderView from '@/views/informationViews/UnderView.vue'
import AfterView from '@/views/informationViews/AfterView.vue'
import MapView from '@/views/mapView/MapView.vue'
import RequestPasswordView from '@/views/login/RequestResetView.vue'
import ResetPasswordConfirmView from '@/views/login/ResetPasswordConfirmView.vue'
import AdminDashboardView from '@/views/adminViews/AdminDashboardView.vue'
import notAuthorizedView from '@/views/mainViews/notAuthorizedView.vue'
import PersonVern from '@/views/mainViews/PersonVern.vue'

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
      meta:{hideNavbar: true, hideFooter: true },
    },
    {
      path: '/request-reset',
      name: 'request-reset',
      component: RequestPasswordView,
      meta:{hideNavbar: true, hideFooter: true },
    },
    {
      path: '/reset-password',
      name: 'reset-password-confirm',
      component: ResetPasswordConfirmView,
      meta:{hideNavbar: true, hideFooter: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta:{hideNavbar: true, hideFooter: true },
    },
    {
      path: '/not-authorized',
      name: 'not-authorized',
      component: notAuthorizedView,
    },
    {
      path: '/admin-dashboard',
      name: 'admin-dashboard',
      component: AdminDashboardView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/storage-detail',
      name: 'storage detail',
      component: StorageDetailView,
      props: true
    },
    {
      path: '/storage',
      name: 'storage',
      component: StorageView,
    },
    {
      path: '/household',
      name: 'household',
      component: HouseholdView,
    },
    {
      path: '/household/create',
      name: 'household-create',
      component: HouseholdCreateView,
    },
    {
      path: '/household/join',
      name: 'household-join',
      component: HouseholdJoinView,
    },
    {
      path: '/household/invite',
      name: 'household-invite',
      component: HouseholdInviteView,
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
      meta:{hideNavbar: true , hideFooter: true },
    },
    {
      path: '/register-failed',
      name: 'RegisterFailed',
      component: RegisterFailedView,
      meta:{hideNavbar: true, hideFooter: true },
    },
    {
      path: '/before',
      name: 'before',
      component: BeforeView,
    },
    {
      path: '/under',
      name: 'under',
      component: UnderView,
    },
    {
      path: '/after',
      name: 'after',
      component: AfterView,
    },
    {
      path: '/personvern',
      name: 'personvern',
      component: PersonVern,
    },
    {
      path: '/2FA',
      name: '2FA',
      component: Admin2FAView,
      props: (route) => {
        if (!route.query.email) {
          return { emailMissing: true };
        }
        return { email: route.query.email };
      },
      meta:{hideNavbar: true },

    },
    {
      path: '/map',
      name: 'map',
      component: MapView,
    }
  ],
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (!userStore.user && localStorage.getItem('jwt')) {
    try {
      await userStore.fetchUser()
    } catch (e) {
      return next('/login')
    }
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return next('/not-authorized')
  }

  if ((to.path === '/login' || to.path === '/register') && userStore.user) {
    return next('/')
  }

  return next()
})


export default router
