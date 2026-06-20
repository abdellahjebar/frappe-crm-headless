<template>
  <div class="flex h-full items-center justify-center bg-surface-white">
    <div class="w-full max-w-sm rounded-2xl border border-outline-base bg-surface-white p-8 shadow-sm">
      <div class="mb-8 flex flex-col items-center gap-3">
        <h1 class="text-2xl-semibold text-ink-gray-9">{{ __('Sign in to CRM') }}</h1>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleLogin">
        <FormControl
          v-model="email"
          type="email"
          :label="__('Email')"
          :placeholder="__('your@email.com')"
          autocomplete="email"
          required
        />
        <FormControl
          v-model="password"
          type="password"
          :label="__('Password')"
          :placeholder="__('••••••••')"
          autocomplete="current-password"
          required
        />

        <div v-if="error" class="rounded-lg bg-surface-red-1 px-3 py-2 text-sm text-ink-red-3">
          {{ error }}
        </div>

        <Button
          type="submit"
          variant="solid"
          :label="__('Sign in')"
          :loading="loading"
          class="mt-2 w-full"
        />
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { sessionStore } from '@/stores/session'

const session = sessionStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleLogin() {
  error.value = ''
  loading.value = true
  try {
    await session.login(email.value, password.value)
  } catch (e) {
    error.value = e.message || __('Invalid email or password')
  } finally {
    loading.value = false
  }
}
</script>
