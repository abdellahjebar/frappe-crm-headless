import { getConfig } from 'frappe-ui'

// Custom translation map — set via setTranslations() for non-Frappe backends.
let _customTranslations = {}

/**
 * Provide a translation map for any backend.
 * Keys are the original English strings; values are translated strings.
 * Optional context key format: "Original:context"
 *
 * @param {Record<string, string>} translations
 *
 * @example
 * import { setTranslations } from '@/translation'
 * setTranslations({ 'Save': 'Enregistrer', 'Delete': 'Supprimer' })
 */
export function setTranslations(translations) {
  _customTranslations = translations
}

export default function translationPlugin(app) {
  app.config.globalProperties.__ = translate
  window.__ = translate
}

function format(message, replace) {
  return message.replace(/{(\d+)}/g, function (match, number) {
    return typeof replace[number] != 'undefined' ? replace[number] : match
  })
}

function translate(message, replace, context = null) {
  // Frappe populates translatedMessages via setConfig(); custom backends use setTranslations().
  // Both are merged, with custom translations taking precedence.
  const frappeMessages = getConfig('translatedMessages') || {}
  const translatedMessages = { ...frappeMessages, ..._customTranslations }

  let translatedMessage = ''

  if (context) {
    const key = `${message}:${context}`
    if (translatedMessages[key]) {
      translatedMessage = translatedMessages[key]
    }
  }

  if (!translatedMessage) {
    translatedMessage = translatedMessages[message] || message
  }

  const hasPlaceholders = /{\d+}/.test(message)
  if (!hasPlaceholders) {
    return translatedMessage
  }

  return format(translatedMessage, replace)
}
