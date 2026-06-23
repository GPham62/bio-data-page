import { describe, it, expect } from 'vitest'
import { mlResults } from './project1'
import en from '../locales/en.json'
import vi from '../locales/vi.json'

// Project 1's ML model was migrated from a CLASSIFIER to a REGRESSION model.
// These tests lock in the new regression shape of `mlResults` and guard the
// new ML locale keys that Project1.jsx (Section 4) renders, so a future shape
// change or a dropped translation key fails loudly here instead of silently
// rendering `undefined` on the page.

describe('project1 mlResults (regression shape)', () => {
  describe('descriptive metadata', () => {
    it('describes a regression task', () => {
      expect(mlResults.task).toBe('Regression')
    })

    it('names the model used', () => {
      expect(mlResults.model).toBe('HistGradientBoosting')
    })

    it('names the continuous prediction target', () => {
      expect(mlResults.target).toBe('US annual salary (salary_year_avg)')
    })
  })

  describe('regression metric fields', () => {
    // Project1.jsx reads exactly these four fields in the ML score cards:
    // mlResults.r2, mlResults.mae, mlResults.trainR2, mlResults.baselineMae.
    it('exposes every field the ML section renders', () => {
      expect(mlResults).toHaveProperty('r2')
      expect(mlResults).toHaveProperty('mae')
      expect(mlResults).toHaveProperty('trainR2')
      expect(mlResults).toHaveProperty('baselineMae')
    })

    it('exposes the supporting regression diagnostics', () => {
      expect(mlResults).toHaveProperty('cvR2')
      expect(mlResults).toHaveProperty('nFeatures')
      expect(mlResults).toHaveProperty('trainSize')
      expect(mlResults).toHaveProperty('testSize')
    })

    it('no longer carries any of the old classifier fields', () => {
      // Old shape: accuracy / rocAuc / f1 / precision / recall / baseline.
      // None should survive the regression migration.
      expect(mlResults).not.toHaveProperty('accuracy')
      expect(mlResults).not.toHaveProperty('rocAuc')
      expect(mlResults).not.toHaveProperty('f1')
      expect(mlResults).not.toHaveProperty('precision')
      expect(mlResults).not.toHaveProperty('recall')
      expect(mlResults).not.toHaveProperty('baseline')
    })

    it('reports r2 as a fraction in the valid [0, 1] range', () => {
      expect(typeof mlResults.r2).toBe('number')
      expect(mlResults.r2).toBeGreaterThanOrEqual(0)
      expect(mlResults.r2).toBeLessThanOrEqual(1)
    })

    it('reports a train R2 in the valid [0, 1] range', () => {
      expect(typeof mlResults.trainR2).toBe('number')
      expect(mlResults.trainR2).toBeGreaterThanOrEqual(0)
      expect(mlResults.trainR2).toBeLessThanOrEqual(1)
    })

    it('shows a mild overfit gap — train R2 is at least as high as test R2', () => {
      // The ml_trainr2_sub copy promises a "mild overfit gap", which only holds
      // if the train score is not below the held-out test score.
      expect(mlResults.trainR2).toBeGreaterThanOrEqual(mlResults.r2)
    })

    it('reports MAE as a positive dollar error', () => {
      expect(typeof mlResults.mae).toBe('number')
      expect(mlResults.mae).toBeGreaterThan(0)
    })

    it('beats the mean-only baseline — model MAE is lower than baseline MAE', () => {
      // The whole point of the model is that it predicts better than always
      // guessing the mean salary, i.e. a smaller average error.
      expect(typeof mlResults.baselineMae).toBe('number')
      expect(mlResults.baselineMae).toBeGreaterThan(0)
      expect(mlResults.mae).toBeLessThan(mlResults.baselineMae)
    })

    it('counts a positive number of features and split sizes', () => {
      expect(mlResults.nFeatures).toBeGreaterThan(0)
      expect(mlResults.trainSize).toBeGreaterThan(0)
      expect(mlResults.testSize).toBeGreaterThan(0)
    })

    it('uses a larger train split than test split', () => {
      expect(mlResults.trainSize).toBeGreaterThan(mlResults.testSize)
    })
  })

  describe('featureImportance array', () => {
    it('is a non-empty array', () => {
      expect(Array.isArray(mlResults.featureImportance)).toBe(true)
      expect(mlResults.featureImportance.length).toBeGreaterThan(0)
    })

    it('gives every entry a feature name, a numeric importance, and a direction', () => {
      mlResults.featureImportance.forEach((item) => {
        expect(typeof item.feature).toBe('string')
        expect(item.feature.length).toBeGreaterThan(0)
        expect(typeof item.importance).toBe('number')
        expect([-1, 1]).toContain(item.direction)
      })
    })

    it('reports only non-negative importances (permutation importance)', () => {
      mlResults.featureImportance.forEach((item) => {
        expect(item.importance).toBeGreaterThanOrEqual(0)
      })
    })
  })
})

describe('project1 ML locale keys (regression migration)', () => {
  // Project1.jsx Section 4 renders these six keys. They replaced the old
  // classifier keys (ml_acc_label, ml_acc_sub, ml_auc_sub, ml_f1_sub).
  const NEW_KEYS = [
    'ml_r2_label',
    'ml_r2_sub',
    'ml_mae_label',
    'ml_mae_sub',
    'ml_trainr2_label',
    'ml_trainr2_sub',
  ]
  const OLD_KEYS = ['ml_acc_label', 'ml_acc_sub', 'ml_auc_sub', 'ml_f1_sub']

  describe.each([
    ['en', en],
    ['vi', vi],
  ])('%s.json', (_name, locale) => {
    it.each(NEW_KEYS)('defines a non-empty p1.%s', (key) => {
      expect(typeof locale.p1[key]).toBe('string')
      expect(locale.p1[key].length).toBeGreaterThan(0)
    })

    it.each(OLD_KEYS)('no longer defines the removed classifier key p1.%s', (key) => {
      expect(locale.p1).not.toHaveProperty(key)
    })
  })

  it('keeps the R2 and MAE metric labels identical across locales (symbols, not words)', () => {
    // "R²" and "MAE" are language-neutral notation and should not be translated.
    expect(en.p1.ml_r2_label).toBe(vi.p1.ml_r2_label)
    expect(en.p1.ml_mae_label).toBe(vi.p1.ml_mae_label)
  })
})
