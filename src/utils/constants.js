// src/utils/constants.js

export const API_BASE_URL = 'https://localhost:7163/api'
export const APP_TITLE = import.meta.env.VITE_APP_TITLE

export const USER_ROLES = {
  ADMIN: 'Admin',
  MANAGER: 'Manager',
  RECEPTIONIST: 'Receptionist',
  TRAINER: 'Trainer'
}

export const MEMBER_STATUS = {
  ACTIVE: 'Active',
  INACTIVE: 'Inactive',
  SUSPENDED: 'Suspended'
}

export const SUBSCRIPTION_STATUS = {
  PENDING: 'Pending',
  ACTIVE: 'Active',
  EXPIRED: 'Expired',
  CANCELLED: 'Cancelled'
}

export const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed',
  REFUNDED: 'Refunded'
}

export const PAYMENT_METHOD = {
  CASH: 'Cash',
  BANK_TRANSFER: 'BankTransfer',
  CREDIT_CARD: 'CreditCard',
  E_WALLET: 'EWallet'
}

export const GENDER_OPTIONS = [
  { value: 'Male', title: 'Male' },
  { value: 'Female', title: 'Female' },
  { value: 'Other', title: 'Other' }
]

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100]
}