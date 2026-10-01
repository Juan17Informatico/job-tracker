import { afterEach, describe, expect, it } from 'vitest'
import { detectLanguage, i18n } from './index'

afterEach(() => void i18n.changeLanguage('en'))

describe('interface language resources', () => {
  it('switches shared UI copy between English and Spanish', async () => {
    await i18n.changeLanguage('es')
    expect(i18n.t('dashboard.add')).toBe('Añadir oportunidad')
    await i18n.changeLanguage('en')
    expect(i18n.t('dashboard.add')).toBe('Add opportunity')
  })

  it('falls back to English for unknown language keys', () => {
    expect(i18n.t('common.savedOnDevice', { lng: 'fr' })).toBe('Saved on your device')
  })

  it('detects Spanish browser preferences without overriding later choices', () => {
    const original = navigator.language
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'es-CO' })
    expect(detectLanguage()).toBe('es')
    Object.defineProperty(navigator, 'language', { configurable: true, value: 'en-US' })
    expect(detectLanguage()).toBe('en')
    Object.defineProperty(navigator, 'language', { configurable: true, value: original })
  })
})
