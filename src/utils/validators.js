// src/utils/validators.js

/**
 * Required field validator
 */
export const required = (value) => {
  if (value === null || value === undefined || value === '') {
    return 'This field is required'
  }
  return true
}

/**
 * Email validator
 */
export const email = (value) => {
  if (!value) return true
  const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return pattern.test(value) || 'Invalid email address'
}

/**
 * Phone number validator (Vietnam format)
 */
export const phoneNumber = (value) => {
  if (!value) return true
  const pattern = /^0\d{9}$/
  return pattern.test(value) || 'Phone number must be 10 digits starting with 0'
}

/**
 * Min length validator
 */
export const minLength = (min) => {
  return (value) => {
    if (!value) return true
    return value.length >= min || `Minimum length is ${min} characters`
  }
}

/**
 * Max length validator
 */
export const maxLength = (max) => {
  return (value) => {
    if (!value) return true
    return value.length <= max || `Maximum length is ${max} characters`
  }
}

/**
 * Number validator
 */
export const number = (value) => {
  if (!value) return true
  return !isNaN(value) || 'Must be a number'
}

/**
 * Positive number validator
 */
export const positiveNumber = (value) => {
  if (!value && value !== 0) return true
  return (Number(value) >= 0) || 'Must be a positive number'
}

/**
 * Min value validator
 */
export const minValue = (min) => {
  return (value) => {
    if (!value && value !== 0) return true
    return (Number(value) >= min) || `Minimum value is ${min}`
  }
}

/**
 * Max value validator
 */
export const maxValue = (max) => {
  return (value) => {
    if (!value && value !== 0) return true
    return (Number(value) <= max) || `Maximum value is ${max}`
  }
}

/**
 * Date validator
 */
export const validDate = (value) => {
  if (!value) return true
  const date = new Date(value)
  return !isNaN(date.getTime()) || 'Invalid date'
}

/**
 * Future date validator
 */
export const futureDate = (value) => {
  if (!value) return true
  const date = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date >= today || 'Date must be today or in the future'
}

/**
 * Past date validator
 */
export const pastDate = (value) => {
  if (!value) return true
  const date = new Date(value)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date <= today || 'Date must be today or in the past'
}