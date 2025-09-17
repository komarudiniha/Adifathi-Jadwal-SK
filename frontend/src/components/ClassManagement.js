import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  Users,
  User
} from 'lucide-react';

const ClassManagement = () => {
  const [classes, setClasses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingClass, setEditingClass] = useState(null);
  const [formData, setFormData] = useState({
    level: '',
    group: '',
    name: '',
    homeroom_teacher: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const levelOptions = [
    { value: 'VII', label: 'Kelas VII' },
    { value: 'VIII', label: 'Kelas VIII' },
    { value: 'IX', label: 'Kelas IX' }
  ];

  const groupOptions = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/classes');
      setClasses(response.data);
    } catch (error) {
      console.error('Error fetching classes:', error);
      showNotification('Gagal memuat data kelas', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      const response = await axios.get('/teachers');
      setTeachers(response.data);
    } catch (error) {
      console.error('Error fetching teachers:', error);
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

    // Auto-generate class name if not provided
    const className = formData.name || `${formData.level}-${formData.group}`;
    const submitData = {
      ...formData,
      name: className,
      homeroom_teacher: formData.homeroom_teacher || null
    };

    try {
      if (editingClass) {
        await axios.put(`/classes/${editingClass.id}`, submitData);
        showNotification('Data kelas berhasil diperbarui', 'success');
      } else {
        await axios.post('/classes', submitData);
        showNotification('Data kelas berhasil ditambahkan', 'success');
      }
      
      await fetchClasses();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (classData) => {
    setEditingClass(classData);
    setFormData({
      level: classData.level,
      group: classData.group,
      name: classData.name,
      homeroom_teacher: classData.homeroom_teacher || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (classId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) {
      try {
        await axios.delete(`/classes/${classId}`);
        showNotification('Data kelas berhasil dihapus', 'success');
        await fetchClasses();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Gagal menghapus data kelas';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClass(null);
    setFormData({
      level: '',
      group: '',
      name: '',
      homeroom_teacher: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => {
      const newData = { ...prev, [name]: value };
      
      // Auto-generate class name when level or group changes
      if (name === 'level' || name === 'group') {
        if (newData.level && newData.group) {
          newData.name = `${newData.level}-${newData.group}`;
        }
      }
      
      return newData;
    });
  };

  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : null;
  };

  // Group classes by level
  const classesByLevel = classes.reduce((acc, classItem) => {
    if (!acc[classItem.level]) {
      acc[classItem.level] = [];
    }
    acc[classItem.level].push(classItem);
    return acc;
  }, {});

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
        <h1 className="text-3xl font-bold text-white mb-2">Data Kelas</h1>
        <p className="text-gray-400">Kelola data kelas dan wali kelas dalam sistem</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ringkasan</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Kelas</span>
                <span className="text-2xl font-bold text-white">{classes.length}</span>
              </div>
              
              {Object.entries(classesByLevel).map(([level, levelClasses]) => (
                <div key={level} className="flex justify-between items-center">
                  <span className="text-gray-400">Kelas {level}</span>
                  <span className="text-lg font-semibold text-orange-400">{levelClasses.length}</span>
                </div>
              ))}
              
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Kelas</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Daftar Kelas</h2>
                  <p className="text-gray-400 text-sm">Kelola kelas dan penugasan wali kelas</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data...</p>
              </div>
            ) : classes.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Data Kelas</h3>
                <p className="text-gray-400 mb-6">Mulai dengan menambahkan kelas pertama</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  Tambah Kelas Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.entries(classesByLevel).sort().map(([level, levelClasses]) => (
                  <div key={level}>
                    <h3 className="text-lg font-semibold text-white mb-3 flex items-center space-x-2">
                      <Calendar className="w-5 h-5 text-orange-400" />
                      <span>Kelas {level}</span>
                      <span className="text-sm text-gray-400">({levelClasses.length} kelas)</span>
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {levelClasses.sort((a, b) => a.group.localeCompare(b.group)).map((classItem) => (
                        <div key={classItem.id} className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                                <Calendar className="w-5 h-5 text-orange-600" />
                              </div>
                              <div>
                                <h4 className="font-semibold text-white">{classItem.name}</h4>
                                <p className="text-sm text-gray-400">Tingkat {classItem.level} - Rombel {classItem.group}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-1">
                              <button
                                onClick={() => handleEdit(classItem)}
                                className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                                title="Edit"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(classItem.id)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                title="Hapus"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center space-x-2 text-sm">
                            <User className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-300">
                              Wali Kelas: {
                                classItem.homeroom_teacher 
                                  ? getTeacherName(classItem.homeroom_teacher) || 'Guru tidak ditemukan'
                                  : 'Belum ditentukan'
                              }
                            </span>
                          </div>
                        </div>
                      ))}
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
                {editingClass ? 'Edit Kelas' : 'Tambah Kelas'}
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
                    Tingkat <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih tingkat kelas</option>
                    {levelOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Rombel <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="group"
                    value={formData.group}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih rombongan belajar</option>
                    {groupOptions.map(group => (
                      <option key={group} value={group}>
                        {group}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Otomatis terisi berdasarkan tingkat dan rombel"
                  />
                  <p className="text-gray-400 text-xs mt-1">Kosongkan untuk menggunakan format otomatis (VII-A, VIII-B, dll)</p>
                </div>

                <div>
                  <label className="form-label">
                    Wali Kelas
                  </label>
                  <select
                    name="homeroom_teacher"
                    value={formData.homeroom_teacher}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="">Pilih wali kelas (opsional)</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </option>
                    ))}
                  </select>
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
                  <span>{editingClass ? 'Perbarui' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassManagement;