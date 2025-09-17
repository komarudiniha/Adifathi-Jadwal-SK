import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  School,
  MapPin,
  User,
  FileText
} from 'lucide-react';

const SchoolManagement = () => {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSchool, setEditingSchool] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    npsn: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchSchools();
  }, []);

  const fetchSchools = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/schools');
      setSchools(response.data);
    } catch (error) {
      console.error('Error fetching schools:', error);
      showNotification('Gagal memuat data sekolah', 'error');
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
      if (editingSchool) {
        await axios.put(`/schools/${editingSchool.id}`, formData);
        showNotification('Data sekolah berhasil diperbarui', 'success');
      } else {
        await axios.post('/schools', formData);
        showNotification('Data sekolah berhasil ditambahkan', 'success');
      }
      
      await fetchSchools();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (school) => {
    setEditingSchool(school);
    setFormData({
      name: school.name,
      npsn: school.npsn,
      address: school.address
    });
    setShowModal(true);
  };

  const handleDelete = async (schoolId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data sekolah ini?')) {
      try {
        await axios.delete(`/schools/${schoolId}`);
        showNotification('Data sekolah berhasil dihapus', 'success');
        await fetchSchools();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Gagal menghapus data sekolah';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSchool(null);
    setFormData({ name: '', npsn: '', address: '' });
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
        <h1 className="text-3xl font-bold text-white mb-2">Data Sekolah</h1>
        <p className="text-gray-400">Kelola informasi sekolah dalam sistem</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Daftar Sekolah</h2>
              <p className="text-gray-400 text-sm">Total: {schools.length} sekolah</p>
            </div>
          </div>
          
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Sekolah</span>
          </button>
        </div>

        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Memuat data...</p>
          </div>
        ) : schools.length === 0 ? (
          <div className="text-center py-12">
            <School className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Data Sekolah</h3>
            <p className="text-gray-400 mb-6">Mulai dengan menambahkan data sekolah pertama</p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary"
            >
              Tambah Sekolah Pertama
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Sekolah</th>
                  <th>NPSN</th>
                  <th>Alamat</th>
                  <th>Kepala Sekolah</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {schools.map((school) => (
                  <tr key={school.id}>
                    <td>
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                          <School className="w-4 h-4 text-blue-600" />
                        </div>
                        <span className="font-medium">{school.name}</span>
                      </div>
                    </td>
                    <td>{school.npsn}</td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <span className="text-sm">{school.address}</span>
                      </div>
                    </td>
                    <td>
                      {school.principal ? (
                        <div className="flex items-center space-x-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-sm">{school.principal}</span>
                        </div>
                      ) : (
                        <span className="text-gray-500 text-sm">Belum ditentukan</span>
                      )}
                    </td>
                    <td>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(school)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(school.id)}
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
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {editingSchool ? 'Edit Sekolah' : 'Tambah Sekolah'}
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
                    Nama Sekolah <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Masukkan nama sekolah"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    NPSN <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="npsn"
                    value={formData.npsn}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Masukkan nomor NPSN"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    Alamat <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="form-input min-h-[80px] resize-none"
                    placeholder="Masukkan alamat lengkap sekolah"
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
                  <span>{editingSchool ? 'Perbarui' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SchoolManagement;