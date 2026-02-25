import api from './axios';

export const adminApi = {
  // ── Dashboard ──────────────────────────────────
  getDashboardStats() {
    return api.get('/admin/dashboard-stats');
  },

  getLowonganStats() {
    return api.get('/admin/lowongan-stats');
  },

  getTopCompanies(limit = 5) {
    return api.get('/admin/top-companies', { params: { limit } });
  },

  getGeographicDistribution() {
    return api.get('/admin/geographic-distribution');
  },

  // ── User Management ────────────────────────────
  getUserStats() {
    return api.get('/admin/user-stats');
  },

  getPendingUsers(perPage = 15) {
    return api.get('/admin/pending-users', { params: { per_page: perPage } });
  },

  approveUser(id) {
    return api.post(`/admin/approve-user/${id}`);
  },

  rejectUser(id, data = {}) {
    return api.post(`/admin/reject-user/${id}`, data);
  },

  getAllAlumni(filters = {}, perPage = 15) {
    return api.get('/admin/alumni', { params: { ...filters, per_page: perPage } });
  },

  getAlumniDetail(id) {
    return api.get(`/admin/alumni/${id}`);
  },

  deleteUser(id) {
    return api.delete(`/admin/users/${id}`);
  },

  exportAlumniCsv(filters = {}) {
    return api.get('/admin/alumni/export', {
      params: filters,
      responseType: 'blob',
    });
  },

  // ── Lowongan Management ────────────────────────
  getLowongan(filters = {}, perPage = 15) {
    return api.get('/admin/lowongan', { params: { ...filters, per_page: perPage } });
  },

  createLowongan(data) {
    return api.post('/admin/lowongan', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  updateLowongan(id, data) {
    return api.put(`/admin/lowongan/${id}`, data);
  },

  deleteLowongan(id) {
    return api.delete(`/admin/lowongan/${id}`);
  },

  getPendingLowongan() {
    return api.get('/admin/lowongan/pending');
  },

  approveLowongan(id) {
    return api.post(`/admin/lowongan/${id}/approve`);
  },

  rejectLowongan(id) {
    return api.post(`/admin/lowongan/${id}/reject`);
  },

  // ── Kuesioner Management ───────────────────────
  getKuesioner(filters = {}, perPage = 15) {
    return api.get('/admin/kuesioner', { params: { ...filters, per_page: perPage } });
  },

  createKuesioner(data) {
    return api.post('/admin/kuesioner', data);
  },

  getKuesionerDetail(id) {
    return api.get(`/admin/kuesioner/${id}`);
  },

  updateKuesioner(id, data) {
    return api.put(`/admin/kuesioner/${id}`, data);
  },

  deleteKuesioner(id) {
    return api.delete(`/admin/kuesioner/${id}`);
  },

  addPertanyaan(kuesionerId, data) {
    return api.post(`/admin/kuesioner/${kuesionerId}/pertanyaan`, data);
  },

  updatePertanyaan(kuesionerId, pertanyaanId, data) {
    return api.put(`/admin/kuesioner/${kuesionerId}/pertanyaan/${pertanyaanId}`, data);
  },

  deletePertanyaan(kuesionerId, pertanyaanId) {
    return api.delete(`/admin/kuesioner/${kuesionerId}/pertanyaan/${pertanyaanId}`);
  },

  // ── Master Data CRUD (admin only) ─────────────
  // Provinsi
  getProvinsi() { return api.get('/admin/master/provinsi'); },
  createProvinsi(data) { return api.post('/admin/master/provinsi', data); },
  updateProvinsi(id, data) { return api.put(`/admin/master/provinsi/${id}`, data); },
  deleteProvinsi(id) { return api.delete(`/admin/master/provinsi/${id}`); },

  // Kota
  getKota() { return api.get('/admin/master/kota'); },
  createKota(data) { return api.post('/admin/master/kota', data); },
  updateKota(id, data) { return api.put(`/admin/master/kota/${id}`, data); },
  deleteKota(id) { return api.delete(`/admin/master/kota/${id}`); },

  // Jurusan (SMK)
  getJurusan() { return api.get('/admin/master/jurusan'); },
  createJurusan(data) { return api.post('/admin/master/jurusan', data); },
  updateJurusan(id, data) { return api.put(`/admin/master/jurusan/${id}`, data); },
  deleteJurusan(id) { return api.delete(`/admin/master/jurusan/${id}`); },

  // Jurusan Kuliah
  getJurusanKuliah() { return api.get('/admin/master/jurusan-kuliah'); },
  createJurusanKuliah(data) { return api.post('/admin/master/jurusan-kuliah', data); },
  updateJurusanKuliah(id, data) { return api.put(`/admin/master/jurusan-kuliah/${id}`, data); },
  deleteJurusanKuliah(id) { return api.delete(`/admin/master/jurusan-kuliah/${id}`); },

  // Skills
  getSkills() { return api.get('/admin/master/skills'); },
  createSkill(data) { return api.post('/admin/master/skills', data); },
  updateSkill(id, data) { return api.put(`/admin/master/skills/${id}`, data); },
  deleteSkill(id) { return api.delete(`/admin/master/skills/${id}`); },

  // Social Media
  getSocialMedia() { return api.get('/admin/master/social-media'); },
  createSocialMedia(data) { return api.post('/admin/master/social-media', data); },
  updateSocialMedia(id, data) { return api.put(`/admin/master/social-media/${id}`, data); },
  deleteSocialMedia(id) { return api.delete(`/admin/master/social-media/${id}`); },

  // Status
  getStatus() { return api.get('/admin/master/status'); },
  createStatus(data) { return api.post('/admin/master/status', data); },
  updateStatus(id, data) { return api.put(`/admin/master/status/${id}`, data); },
  deleteStatus(id) { return api.delete(`/admin/master/status/${id}`); },

  // Bidang Usaha
  getBidangUsaha() { return api.get('/admin/master/bidang-usaha'); },
  createBidangUsaha(data) { return api.post('/admin/master/bidang-usaha', data); },
  updateBidangUsaha(id, data) { return api.put(`/admin/master/bidang-usaha/${id}`, data); },
  deleteBidangUsaha(id) { return api.delete(`/admin/master/bidang-usaha/${id}`); },

  // Perusahaan
  getPerusahaan(filters = {}) { return api.get('/admin/master/perusahaan', { params: filters }); },
  createPerusahaan(data) { return api.post('/admin/master/perusahaan', data); },
  updatePerusahaan(id, data) { return api.put(`/admin/master/perusahaan/${id}`, data); },
  deletePerusahaan(id) { return api.delete(`/admin/master/perusahaan/${id}`); },

  // Universitas
  getUniversitas() { return api.get('/admin/master/universitas'); },
  createUniversitas(data) { return api.post('/admin/master/universitas', data); },

  // Tipe Pekerjaan
  getTipePekerjaan() { return api.get('/admin/master/tipe-pekerjaan'); },
};
