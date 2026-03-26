import api from './api'

export const roleService = {
  async getAll() {
    const r = await api.get('/Roles')
    return r.data
  },

  async getById(id) {
    const r = await api.get(`/Roles/${id}`)
    return r.data
  },

  async create(role) {
    const r = await api.post('/Roles', role)
    return r.data
  },

  async update(id, role) {
    const r = await api.put(`/Roles/${id}`, role)
    return r.data
  },

  async delete(id) {
    const r = await api.delete(`/Roles/${id}`)
    return r.data
  }
}
