import api from './api'

export const billingService = {
  async getProducts() {
    const response = await api.get('/Billing/products')
    return response.data
  },
  async createProduct(data) {
    const response = await api.post('/Billing/products', data)
    return response.data
  },
  async getInvoices() {
    const response = await api.get('/Billing/invoices')
    return response.data
  },
  async getInvoiceById(id) {
    const response = await api.get(`/Billing/invoices/${id}`)
    return response.data
  },
  async createInvoice(data) {
    const response = await api.post('/Billing/invoices', data)
    return response.data
  }
}
