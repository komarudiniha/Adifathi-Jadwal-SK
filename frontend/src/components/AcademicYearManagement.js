import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  Calendar,
  BookOpen,
  Clock,
  CheckCircle,
  Circle
} from 'lucide-react';

const AcademicYearManagement = () => {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingYear, setEditingYear] = useState(null);
  const [formData, setFormData] = useState({
    school_year: '',
    semester: '',
    curriculum: '',
    max_time_allocation: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const semesterOptions = ['Gasal', 'Genap'];
  const curriculumOptions = [
    'Kurikulum 2013',
    'Kurikulum Merdeka',
    'KTSP',
    'Kurikulum Darurat'
  ];

  // Generate school year options (current year - 2 to current year + 3)
  const generateSchoolYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const options = [];
    for (let i = currentYear - 2; i <= currentYear + 3; i++) {
      options.push(`${i}/${i + 1}`);
    }
    return options;
  };

  useEffect(() => {
    fetchAcademicYears();
  }, []);

  const fetchAcademicYears = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/academic-years');
      setAcademicYears(response.data);
    } catch (error) {
      console.error('Error fetching academic years:', error);
      showNotification('Gagal memuat data tahun akademik', 'error');
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
      max_time_allocation: parseInt(formData.max_time_allocation)
    };

    try {
      if (editingYear) {
        await axios.put(`/academic-years/${editingYear.id}`, submitData);
        showNotification('Data tahun akademik berhasil diperbarui', 'success');
      } else {
        await axios.post('/academic-years', submitData);
        showNotification('Data tahun akademik berhasil ditambahkan', 'success');
      }
      
      await fetchAcademicYears();
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (year) => {
    setEditingYear(year);
    setFormData({
      school_year: year.school_year,
      semester: year.semester,
      curriculum: year.curriculum,
      max_time_allocation: year.max_time_allocation.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (yearId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus tahun akademik ini?')) {
      try {
        await axios.delete(`/academic-years/${yearId}`);
        showNotification('Data tahun akademik berhasil dihapus', 'success');
        await fetchAcademicYears();
      } catch (error) {
        const errorMessage = error.response?.data?.detail || 'Gagal menghapus data tahun akademik';
        showNotification(errorMessage, 'error');
      }
    }
  };

  const handleToggleActive = async (year) => {
    try {
      // First, set all academic years to inactive
      await Promise.all(
        academicYears.map(ay => 
          axios.put(`/academic-years/${ay.id}`, {
            ...ay,
            is_active: false
          })
        )
      );

      // Then set the selected year as active
      await axios.put(`/academic-years/${year.id}`, {
        ...year,
        is_active: !year.is_active
      });

      showNotification(
        year.is_active 
          ? 'Tahun akademik dinonaktifkan' 
          : 'Tahun akademik diaktifkan', 
        'success'
      );
      await fetchAcademicYears();
    } catch (error) {
      showNotification('Gagal mengubah status tahun akademik', 'error');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingYear(null);
    setFormData({
      school_year: '',
      semester: '',
      curriculum: '',
      max_time_allocation: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const activeYear = academicYears.find(year => year.is_active);

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
        <h1 className="text-3xl font-bold text-white mb-2">Tahun Akademik</h1>
        <p className="text-gray-400">Kelola tahun pelajaran, semester, dan kurikulum yang berlaku</p>
      </div>

      {/* Active Academic Year Banner */}
      {activeYear && (
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Tahun Akademik Aktif</h3>
                <p className="text-blue-100">
                  {activeYear.school_year} - {activeYear.semester} • {activeYear.curriculum}
                </p>
                <p className="text-blue-200 text-sm">
                  Maksimal Alokasi Waktu: {activeYear.max_time_allocation} JP
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex items-center space-x-2 bg-white/20 rounded-full px-4 py-2">
                <CheckCircle className="w-4 h-4 text-white" />
                <span className="text-white font-medium">Aktif</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ringkasan</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Tahun Akademik</span>
                <span className="text-2xl font-bold text-white">{academicYears.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Yang Aktif</span>
                <span className="text-2xl font-bold text-indigo-400">
                  {academicYears.filter(year => year.is_active).length}
                </span>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Tahun Akademik</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Daftar Tahun Akademik</h2>
                  <p className="text-gray-400 text-sm">Kelola tahun pelajaran dan kurikulum</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data...</p>
              </div>
            ) : academicYears.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Tahun Akademik</h3>
                <p className="text-gray-400 mb-6">Mulai dengan menambahkan tahun akademik pertama</p>
                <button
                  onClick={() => setShowModal(true)}
                  className="btn-primary"
                >
                  Tambah Tahun Akademik Pertama
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {academicYears.map((year) => (
                  <div
                    key={year.id}
                    className={`p-4 rounded-lg border transition-all ${
                      year.is_active
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-slate-700 border-slate-600 hover:border-slate-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={() => handleToggleActive(year)}
                          className={`p-2 rounded-lg transition-colors ${
                            year.is_active
                              ? 'text-blue-400 hover:text-blue-300'
                              : 'text-gray-400 hover:text-gray-300'
                          }`}
                          title={year.is_active ? 'Nonaktifkan' : 'Aktifkan'}
                        >
                          {year.is_active ? (
                            <CheckCircle className="w-5 h-5" />
                          ) : (
                            <Circle className="w-5 h-5" />
                          )}
                        </button>
                        
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-white text-lg">
                              {year.school_year} - {year.semester}
                            </h4>
                            {year.is_active && (
                              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full">
                                Aktif
                              </span>
                            )}
                          </div>
                          <div className="flex items-center space-x-4 mt-1 text-sm text-gray-400">
                            <div className="flex items-center space-x-1">
                              <BookOpen className="w-4 h-4" />
                              <span>{year.curriculum}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>Max {year.max_time_allocation} JP</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(year)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(year.id)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Hapus"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
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
                {editingYear ? 'Edit Tahun Akademik' : 'Tambah Tahun Akademik'}
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
                    Tahun Pelajaran <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="school_year"
                    value={formData.school_year}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih tahun pelajaran</option>
                    {generateSchoolYearOptions().map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Semester <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih semester</option>
                    {semesterOptions.map(semester => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Kurikulum <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="curriculum"
                    value={formData.curriculum}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih kurikulum</option>
                    {curriculumOptions.map(curriculum => (
                      <option key={curriculum} value={curriculum}>
                        {curriculum}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Batas Maksimal Alokasi Waktu (JP) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="max_time_allocation"
                    value={formData.max_time_allocation}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Contoh: 40"
                    min="20"
                    max="60"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">JP = Jam Pelajaran per minggu (20-60)</p>
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
                  <span>{editingYear ? 'Perbarui' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AcademicYearManagement;