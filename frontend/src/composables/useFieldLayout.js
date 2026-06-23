export const FIELD_LAYOUT_KEY = 'fieldLayoutContext'

export function makeSafeContext() {
  return {
    doctype: '',
    docname: '',
    preview: false,
    isGridRow: false,
    triggerOnChange: async () => {},
    triggerButton: async () => {},
    triggerOnRowAdd: async () => {},
    triggerOnRowRemove: async () => {},
    fieldPropertyOverrides: {},
    ruleOverrides: {},
    formDocument: null,
    parentDoc: null,
    parentFieldname: null,
  }
}
