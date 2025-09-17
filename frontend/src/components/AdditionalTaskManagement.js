import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  ClipboardList,
  Clock,
  Award,
  Users
} from 'lucide-react';

const AdditionalTaskManagement = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    equivalent_hours: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  // Predefined common additional tasks for Indonesian schools
  const commonTasks = [
    { name: 'Kepala Sekolah', equivalent_hours: 24 },
    { name: 'Wakil Kepala Sekolah', equivalent_hours: 12 },
    { name: 'Wali Kelas', equivalent_hours: 2 },
    { name: 'Koordinator Mata Pelajaran', equivalent_hours: 4 },
    { name: 'Pembina OSIS', equivalent_hours: 2 },
    { name: 'Pembina Pramuka', equivalent_hours: 2 },
    { name: 'Koordinator BK', equivalent_hours: 6 },
    { name: 'Kepala Perpustakaan', equivalent_hours: 4 },
    { name: 'Kepala Laboratorium', equivalent_hours: 4 },
    { name: 'Koordinator TIK', equivalent_hours: 4 },
    { name: 'Pembina Ekstrakurikuler', equivalent_hours: 2 },
    { name: 'Koordinator UKS', equivalent_hours: 2 },
    { name: 'Tim Pengembang Kurikulum', equivalent_hours: 4 },
    { name: 'Koordinator Ujian', equivalent_hours: 3 },
    { name: 'Piket Harian', equivalent_hours: 1 }
  ];

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/additional-tasks');
      setTasks(response.data);
    } catch (error) {
      console.error('Error fetching additional tasks:', error);
      showNotification('Gagal memuat data tugas tambahan', 'error');
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

    const submitData = {
      ...formData,
      equivalent_hours: parseInt(formData.equivalent_hours)
    };

    try {
      if (editingTask) {
        await axios.put(`/additional-tasks/${editingTask.id}`, submitData);
        showNotification('Data tugas tambahan berhasil diperbarui', 'success');
      } else {
        await axios.post('/additional-tasks', submitData);
        showNotification('Data tugas tambahan berhasil ditambahkan', 'success');
      }
      
      await fetchTasks();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      name: task.name,
      equivalent_hours: task.equivalent_hours.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (taskId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tugas tambahan ini?')) {
      try {
        await axios.delete(`/additional-tasks/${taskId}`);
        showNotification('Data tugas tambahan berhasil dihapus', 'success');
        await fetchTasks();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Gagal menghapus data tugas tambahan';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleQuickAdd = async (task) => {
    try {
      await axios.post('/additional-tasks', task);
      showNotification(`Tugas tambahan "${task.name}" berhasil ditambahkan`, 'success');
      await fetchTasks();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Gagal menambahkan tugas tambahan';
      showNotification(errorMessage, 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTask(null);
    setFormData({
      name: '',
      equivalent_hours: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Calculate total equivalent hours
  const totalEquivalentHours = tasks.reduce((sum, task) => sum + task.equivalent_hours, 0);

  // Filter common tasks that haven't been added yet
  const availableCommonTasks = commonTasks.filter(
    commonTask => !tasks.some(task => task.name === commonTask.name)
  );

  const getTaskCategoryColor = (hours) => {
    if (hours >= 20) return 'bg-red-600';
    if (hours >= 10) return 'bg-orange-600';
    if (hours >= 5) return 'bg-yellow-600';
    return 'bg-green-600';
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
        <h1 className="text-3xl font-bold text-white mb-2">Tugas Tambahan</h1>
        <p className="text-gray-400">Kelola jenis tugas tambahan guru dan ekuivalen jam pelajaran (JP)</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="card p-6 mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                <ClipboardList className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ringkasan</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Tugas</span>
                <span className="text-2xl font-bold text-white">{tasks.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Ekuivalen JP</span>
                <span className="text-2xl font-bold text-teal-400">{totalEquivalentHours}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tugas</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Add Common Tasks */}
          {availableCommonTasks.length > 0 && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center space-x-2">
                <Award className="w-5 h-5 text-teal-400" />
                <span>Tugas Umum</span>
              </h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {availableCommonTasks.slice(0, 8).map((task, index) => (
                  <button
                    key={index}
                    onClick={() => handleQuickAdd(task)}
                    className="w-full p-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-left transition-colors group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-white text-sm group-hover:text-teal-300">
                        {task.name}
                      </span>
                      <span className="text-teal-400 text-xs font-semibold">
                        {task.equivalent_hours} JP
                      </span>
                    </div>
                  </button>
                ))}
              </div>
              {availableCommonTasks.length > 8 && (
                <p className="text-gray-400 text-xs mt-2 text-center">
                  +{availableCommonTasks.length - 8} tugas lainnya
                </p>
              )}
            </div>
          )}
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-teal-600 rounded-lg flex items-center justify-center">
                  <ClipboardList className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Daftar Tugas Tambahan</h2>
                  <p className="text-gray-400 text-sm">Kelola tugas tambahan dan ekuivalen JP</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-teal-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Tugas Tambahan</h3>
                <p className="text-gray-400 mb-6">Mulai dengan menambahkan tugas tambahan pertama</p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={() => setShowModal(true)}
                    className="btn-primary"
                  >
                    Tambah Manual
                  </button>
                  {availableCommonTasks.length > 0 && (
                    <button
                      onClick={() => handleQuickAdd(availableCommonTasks[0])}
                      className="btn-secondary"
                    >
                      Tambah "{availableCommonTasks[0].name}"
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tasks.sort((a, b) => b.equivalent_hours - a.equivalent_hours).map((task) => (
                  <div
                    key={task.id}
                    className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${getTaskCategoryColor(task.equivalent_hours)}`}></div>
                        <h4 className="font-semibold text-white">{task.name}</h4>
                      </div>
                      
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEdit(task)}
                          className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(task.id)}
                          className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <Clock className="w-4 h-4" />
                        <span>Ekuivalen JP</span>
                      </div>
                      <span className="text-lg font-bold text-teal-400">
                        {task.equivalent_hours} JP
                      </span>
                    </div>
                  </div>
                ))}
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
                {editingTask ? 'Edit Tugas Tambahan' : 'Tambah Tugas Tambahan'}
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
                    Nama Tugas Tambahan <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Contoh: Wali Kelas, Koordinator Mata Pelajaran"
                    required
                  />
                </div>

                <div>
                  <label className="form-label">
                    Ekuivalen JP (Jam Pelajaran) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="equivalent_hours"
                    value={formData.equivalent_hours}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Contoh: 2"
                    min="1"
                    max="30"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Setara dengan berapa jam pelajaran per minggu (1-30 JP)
                  </p>
                </div>

                {/* Reference Guide */}
                <div className="bg-slate-700 rounded-lg p-4">
                  <h4 className="text-sm font-semibold text-white mb-2">Panduan Ekuivalen JP:</h4>
                  <div className="text-xs text-gray-300 space-y-1">
                    <div className="flex justify-between">
                      <span>• Tugas Ringan (1-2 JP)</span>
                      <span className="text-green-400">Wali Kelas, Piket</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Tugas Sedang (3-6 JP)</span>
                      <span className="text-yellow-400">Koordinator, Kepala Lab</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Tugas Berat (7-15 JP)</span>
                      <span className="text-orange-400">Wakasek, Koordinator BK</span>
                    </div>
                    <div className="flex justify-between">
                      <span>• Tugas Struktural (16+ JP)</span>
                      <span className="text-red-400">Kepala Sekolah</span>
                    </div>
                  </div>
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
                  <span>{editingTask ? 'Perbarui' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdditionalTaskManagement;