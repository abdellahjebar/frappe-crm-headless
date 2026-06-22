import { useQuery } from '@/composables/useQuery'
import { reactive, ref } from 'vue'

const settings = ref({})
const brand = reactive({})

const _settings = useQuery({
  url: 'frappe.client.get',
  params: { doctype: 'FCRM Settings', name: 'FCRM Settings' },
  auto: true,
  onSuccess: (data) => {
    settings.value = data
    getSettings().setupBrand()
  },
})

export function getSettings() {
  function setupBrand() {
    brand.name = settings.value?.brand_name
    brand.logo = settings.value?.brand_logo
    brand.favicon = settings.value?.favicon
  }

  return {
    _settings,
    settings,
    brand,
    setupBrand,
  }
}
