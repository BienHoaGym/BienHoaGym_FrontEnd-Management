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
  },
  async downloadInvoicePdf(id) {
    const response = await api.get(`/Billing/invoices/${id}/pdf`, {
      responseType: 'blob'
    })
    const url = window.URL.createObjectURL(new Blob([response.data]))
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `HoaDon-${id}.pdf`)
    document.body.appendChild(link)
    link.click()
    link.remove()
    return true
  }
}
