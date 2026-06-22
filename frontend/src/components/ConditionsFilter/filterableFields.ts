import { useQuery } from '@/composables/useQuery'

export const filterableFields = useQuery({
  url: 'crm.api.doc.get_filterable_fields',
  transform: (data) => {
    return data
      .filter((field) => !field.fieldname.startsWith('_'))
      .map((field) => ({
        label: field.label,
        value: field.fieldname,
        ...field,
      }))
  },
})
