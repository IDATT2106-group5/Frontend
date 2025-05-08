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
import StorageView from '@/views/storageViews/StorageView.vue'
import HouseholdCreateView from '@/views/householdViews/HouseholdCreateView.vue'
import HouseholdJoinView from '@/views/householdViews/HouseholdJoinView.vue'
import Admin2FAView from '@/views/adminViews/Admin2FAView.vue'
import PrepareCrisisView from '@/views/beforeCrisisViews/PrepareCrisisView.vue'
import QuizView from '@/views/beforeCrisisViews/QuizView.vue'
import SeekSafetyView from '@/views/underCrisisViews/SeekSafetyView.vue'
import EmergencyTipsView from '@/views/underCrisisViews/EmergencyTipsView.vue'
import AlertView from '@/views/beforeCrisisViews/AlertView.vue'
import TalkAboutItView from '@/views/afterCrisisViews/TalkAboutItView.vue'
import MentalHealthView from '@/views/afterCrisisViews/MentalHealthView.vue'
import ImproveView from '@/views/afterCrisisViews/ImproveView.vue'
import AboutView from '@/views/mainViews/AboutView.vue'
import ContactView from '@/views/mainViews/ContactView.vue'
import QuestionsView from '@/views/mainViews/QuestionsView.vue'
import MapView from '@/views/mapView/MapView.vue'
import AdminRegisterView from '@/views/adminViews/AdminRegisterView.vue'
import RequestPasswordView from '@/views/login/RequestResetView.vue'
import ResetPasswordConfirmView from '@/views/login/ResetPasswordConfirmView.vue'
import AdminDashboardView from '@/views/adminViews/AdminDashboardView.vue'
import notAuthorizedView from '@/views/mainViews/notAuthorizedView.vue'
import PersonVern from '@/views/mainViews/PersonVern.vue'
import AdminUserView from '@/views/adminViews/AdminUsersView.vue'
import MarkerAdmin from '@/views/adminViews/MarkerAdmin.vue'
import IncidentAdmin from '@/views/adminViews/IncidentAdmin.vue'
import ScenarioList from '@/components/scenario/ScenarioList.vue'
import ScenarioAdminView from '@/views/ScenarioAdminView.vue'
import EditScenarioList from '@/components/scenario/EditScenarioList.vue'
import ScenarioInfo from '@/components/scenario/ScenarioInfo.vue'
import NyhetsView from '@/views/nyheter/NyhetsView.vue'

const routes = [
  // --- Public ---
  { path: '/', name: 'home', component: HomeView },
  { path: '/about', name: 'about', component: AboutView },
  { path: '/contact', name: 'contact', component: ContactView },
  { path: '/questions', name: 'questions', component: QuestionsView },
  { path: '/nyheter', name: 'NyhetsView', component: NyhetsView },
  { path: '/before', name: 'before', component: PrepareCrisisView },
  { path: '/quiz', name: 'quiz', component: QuizView },
  { path: '/seek-safety', name: 'seek-safety', component: SeekSafetyView },
  { path: '/emergency-tips', name: 'emergency-tips', component: EmergencyTipsView },
  { path: '/alert', name: 'alert', component: AlertView },
  { path: '/talk', name: 'talk', component: TalkAboutItView },
  { path: '/mental', name: 'mental', component: MentalHealthView },
  { path: '/improve', name: 'improve', component: ImproveView },
  { path: '/personvern', name: 'personvern', component: PersonVern },
  { path: '/map', name: 'map', component: MapView },
  { path: '/household', name: 'household', component: HouseholdView },
  { path: '/scenarios', name: 'ScenarioList', component: ScenarioList },
  { path: '/scenarios/:id', name: 'ScenarioInfo', component: ScenarioInfo, props: true },

  // --- Guest only ---
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },
  {
    path: '/request-reset',
    name: 'request-reset',
    component: RequestPasswordView,
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },
  {
    path: '/reset-password',
    name: 'reset-password-confirm',
    component: ResetPasswordConfirmView,
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },
  {
    path: '/verify-email',
    name: 'VerifyEmail',
    component: VerifyEmailView,
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },
  {
    path: '/register-success',
    name: 'RegisterSuccess',
    component: RegisterSuccessView,
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },
  {
    path: '/register-failed',
    name: 'RegisterFailed',
    component: RegisterFailedView,
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },

  // --- Authenticated only ---
  {
    path: '/storage',
    name: 'storage',
    component: StorageView,
    meta: { requiresAuth: true }
  },
  {
    path: '/storage-detail',
    name: 'storage-detail',
    component: StorageDetailView,
    props: true,
    meta: { requiresAuth: true }
  },
  {
    path: '/household/create',
    name: 'household-create',
    component: HouseholdCreateView,
    meta: { requiresAuth: true }
  },
  {
    path: '/household/join',
    name: 'household-join',
    component: HouseholdJoinView,
    meta: { requiresAuth: true }
  },

  // --- Admin only ---
  {
    path: '/admin-dashboard',
    name: 'admin-dashboard',
    component: AdminDashboardView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin-users',
    name: 'admin-users',
    component: AdminUserView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/map-icons',
    name: 'MarkerAdmin',
    component: MarkerAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/incidents',
    name: 'IncidentAdmin',
    component: IncidentAdmin,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin-scenarios',
    name: 'AdminScenarioList',
    component: EditScenarioList,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin-scenarios/new',
    name: 'CreateScenario',
    component: ScenarioAdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin-scenarios/:id',
    name: 'EditScenario',
    component: ScenarioAdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },

  // --- Special (2FA & admin-registration) ---
  {
    path: '/2FA',
    name: '2FA',
    component: Admin2FAView,
    props: route => ({ email: route.query.email }),
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },
  {
    path: '/admin-registration',
    name: 'admin-registration',
    component: AdminRegisterView,
    props: route => ({ email: route.query.email, token: route.query.token }),
    meta: { requiresGuest: true, hideNavbar: true, hideFooter: true }
  },

  // --- Not authorized ---
  {
    path: '/not-authorized',
    name: 'not-authorized',
    component: notAuthorizedView
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore()

  if (!userStore.user && localStorage.getItem('jwt')) {
    try {
      await userStore.fetchUser()
    } catch {
      userStore.logout()
    }
  }

  const loggedIn = userStore.isLoggedIn

  if (to.meta.requiresAuth && !loggedIn) {
    return next({ name: 'login' })
  }

  if (to.meta.requiresGuest && loggedIn) {
    return next({ name: 'home' })
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return next({ name: 'not-authorized' })
  }

  next()
})

export default router
