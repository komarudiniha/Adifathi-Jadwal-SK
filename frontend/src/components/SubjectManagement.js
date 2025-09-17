import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  BookOpen,
  Clock,
  Hash
} from 'lucide-react';

const SubjectManagement = () => {
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubject, setEditingSubject] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    time_allocation: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchSubjects = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/subjects');
      setSubjects(response.data);
    } catch (error) {
      console.error('Error fetching subjects:', error);
      showNotification('Gagal memuat data mata pelajaran', 'error');
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

    // Convert time_allocation to number
    const submitData = {
      ...formData,
      time_allocation: parseInt(formData.time_allocation)
    };

    try {
      if (editingSubject) {
        await axios.put(`/subjects/${editingSubject.id}`, submitData);
        showNotification('Data mata pelajaran berhasil diperbarui', 'success');
      } else {
        await axios.post('/subjects', submitData);
        showNotification('Data mata pelajaran berhasil ditambahkan', 'success');
      }
      
      await fetchSubjects();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (subject) => {
    setEditingSubject(subject);
    setFormData({
      code: subject.code,
      name: subject.name,
      time_allocation: subject.time_allocation.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (subjectId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini?')) {
      try {
        await axios.delete(`/subjects/${subjectId}`);
        showNotification('Data mata pelajaran berhasil dihapus', 'success');
        await fetchSubjects();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Gagal menghapus data mata pelajaran';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingSubject(null);
    setFormData({
      code: '',
      name: '',
      time_allocation: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate total JP (Jam Pelajaran)
  const totalJP = subjects.reduce((sum, subject) => sum + subject.time_allocation, 0);

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
        <h1 className="text-3xl font-bold text-white mb-2">Mata Pelajaran</h1>
        <p className="text-gray-400">Kelola data mata pelajaran dan alokasi waktu pembelajaran</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ringkasan</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Mata Pelajaran</span>
                <span className="text-2xl font-bold text-white">{subjects.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total JP</span>
                <span className="text-2xl font-bold text-purple-400">{totalJP}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Mata Pelajaran</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-600 rounded-lg flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Daftar Mata Pelajaran</h2>
                  <p className="text-gray-400 text-sm">Kelola mata pelajaran dan alokasi waktu</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data...</p>
              </div>
            ) : subjects.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Mata Pelajaran</h3>
                <p className="text-gray-400 mb-6">Mulai dengan menambahkan mata pelajaran pertama</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  Tambah Mata Pelajaran Pertama
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Kode</th>
                      <th>Nama Mata Pelajaran</th>
                      <th>Alokasi Waktu</th>
                      <th>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects.map((subject) => (
                      <tr key={subject.id}>
                        <td>
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                              <Hash className="w-4 h-4 text-purple-600" />
                            </div>
                            <span className="font-mono font-bold text-purple-400">{subject.code}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-3">
                            <BookOpen className="w-4 h-4 text-gray-400" />
                            <span className="font-medium">{subject.name}</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm font-semibold">{subject.time_allocation} JP</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleEdit(subject)}
                              className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(subject.id)}
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
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 modal-backdrop z-50 flex items-center justify-center p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-md">
            <div className="flex items-center justify-between p-6 border-b border-slate-700">
              <h3 className="text-lg font-semibold text-white">
                {editingSubject ? 'Edit Mata Pelajaran' : 'Tambah Mata Pelajaran'}
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
                    Kode Mata Pelajaran <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Contoh: MAT, IPA, BIN"
                    style={{ textTransform: 'uppercase' }}
                    maxLength="5"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">Maksimal 5 karakter, huruf kapital</p>
                </div>

                <div>
                  <label className="form-label">
                    Nama Mata Pelajaran <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Contoh: Matematika, Ilmu Pengetahuan Alam"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    Alokasi Waktu (JP) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="time_allocation"
                    value={formData.time_allocation}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Contoh: 4"
                    min="1"
                    max="20"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">JP = Jam Pelajaran per minggu (1-20)</p>
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
                  <span>{editingSubject ? 'Perbarui' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;