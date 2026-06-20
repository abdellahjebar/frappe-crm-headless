import { defineStore } from 'pinia'
import { getAdapter } from '@/api'
import router from '@/router'
import { ref, computed } from 'vue'

export const sessionStore = defineStore('crm-session', () => {
  let user = ref(import.meta.env.VITE_DEV_USER || getAdapter().auth.getUser())
  const isLoggedIn = computed(() => !!user.value)

  async function login(email, password) {
    try {
      await getAdapter().auth.login(email, password)
      user.value = getAdapter().auth.getUser()
      router.replace({ path: '/' })
    } catch {
      throw new Error(__('Invalid Email or Password'))
    }
  }

  async function logout() {
    await getAdapter().auth.logout()
    user.value = null
    router.replace({ name: 'Login' })
  }

  return {
    user,
    isLoggedIn,
    login,
    logout,
  }
})
