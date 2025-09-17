import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Users,
  Calendar,
  GraduationCap,
  IdCard
} from 'lucide-react';

const TeacherManagement = () => {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    nip_nuptk: '',
    tmt: '',
    education: '',
    major: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchTeachers();
  }, []);

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      showNotification('Gagal memuat data guru', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: '' });
    }, 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingTeacher) {
        await axios.put(`/teachers/${editingTeacher.id}`, formData);
        showNotification('Data guru berhasil diperbarui', 'success');
      } else {
        await axios.post('/teachers', formData);
        showNotification('Data guru berhasil ditambahkan', 'success');
      }
      
      await fetchTeachers();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (teacher) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      nip_nuptk: teacher.nip_nuptk,
      tmt: teacher.tmt,
      education: teacher.education,
      major: teacher.major
    });
    setShowModal(true);
  };

  const handleDelete = async (teacherId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data guru ini?')) {
      try {
        await axios.delete(`/teachers/${teacherId}`);
        showNotification('Data guru berhasil dihapus', 'success');
        await fetchTeachers();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Gagal menghapus data guru';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTeacher(null);
    setFormData({
      name: '',
      nip_nuptk: '',
      tmt: '',
      education: '',
      major: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="p-6">
      {/* Notification */}
      {notification.show && (
        <div className={`notification fade-in ${
          notification.type === 'success' ? 'notification-success' : 'notification-error'
        }`}>
          {notification.message}
        </div>
      )}

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Data Guru</h1>
        <p className="text-gray-400">Kelola informasi guru dalam sistem</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Daftar Guru</h2>
              <p className="text-gray-400 text-sm">Total: {teachers.length} guru</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Guru</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-green-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data...</p>
          </div>
        ) : teachers.length === 0 ? (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Data Guru</h3>
            <p className="text-gray-400 mb-6">Mulai dengan menambahkan data guru pertama</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Tambah Guru Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Guru</th>
                  <th>NIP/NUPTK</th>
                  <th>TMT</th>
                  <th>Pendidikan</th>
                  <th>Jurusan</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {teachers.map((teacher) => (
                  <tr key={teacher.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                          <Users className="w-4 h-4 text-green-600" />
                        </div>
                        <span className="font-medium">{teacher.name}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <IdCard className="w-4 h-4 text-gray-400" />
                        <span className="text-sm font-mono">{teacher.nip_nuptk}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{teacher.tmt}</span>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <GraduationCap className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{teacher.education}</span>
                      </div>
                    </td>
                    <td>
                      <span className="text-sm text-gray-300">{teacher.major}</span>
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(teacher)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(teacher.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-lg">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {editingTeacher ? 'Edit Guru' : 'Tambah Guru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6">
              {error && (
                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-300 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="form-label">
                    Nama Guru <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Masukkan nama lengkap guru"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    NIP/NUPTK <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="nip_nuptk"
                    value={formData.nip_nuptk}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Masukkan NIP atau NUPTK"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    TMT (Tanggal Mulai Tugas) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="tmt"
                    value={formData.tmt}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    Pendidikan <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="education"
                    value={formData.education}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih tingkat pendidikan</option>
                    <option value="D3">D3</option>
                    <option value="S1">S1</option>
                    <option value="S2">S2</option>
                    <option value="S3">S3</option>
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Jurusan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="major"
                    value={formData.major}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Masukkan jurusan/bidang studi"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn-secondary"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn-primary flex items-center space-x-2"
                >
                  <Save className="w-4 h-4" />
                  <span>{editingTeacher ? 'Perbarui' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;