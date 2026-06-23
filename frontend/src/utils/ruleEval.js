// evaluateRules — pure function, no imports.
// Takes the `rules` class property and the live `doc` object; returns a flat
// map of { [fieldname]: { [property]: resolvedValue } }.
// Called from a Vue watchEffect in setupFormController so it re-runs
// automatically whenever doc properties accessed by the predicates change.

export function evaluateRules(rules, doc) {
  if (!rules || typeof rules !== 'object') return {}
  const result = {}
  for (const fieldname of Object.keys(rules)) {
    const fieldRules = rules[fieldname]
    if (!fieldRules || typeof fieldRules !== 'object') continue
    const fieldResult = {}
    for (const property of Object.keys(fieldRules)) {
      const fn = fieldRules[property]
      try {
        const val = typeof fn === 'function' ? fn(doc) : fn
        if (val !== undefined) fieldResult[property] = val
      } catch (err) {
        console.warn(`CRM Script: rule for "${fieldname}.${property}" threw:`, err)
      }
    }
    if (Object.keys(fieldResult).length) result[fieldname] = fieldResult
  }
  return result
}
