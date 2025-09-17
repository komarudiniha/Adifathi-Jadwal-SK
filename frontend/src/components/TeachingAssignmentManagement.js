import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  BookOpen,
  Users,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  User,
  Award
} from 'lucide-react';

const TeachingAssignmentManagement = () => {
  const [assignments, setAssignments] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classes, setClasses] = useState([]);
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [formData, setFormData] = useState({
    teacher_id: '',
    subject_id: '',
    class_id: '',
    academic_year_id: '',
    weekly_hours: ''
  });
  const [error, setError] = useState('');
  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [teachersRes, subjectsRes, classesRes, academicYearsRes] = await Promise.all([
        axios.get('/teachers'),
        axios.get('/subjects'),
        axios.get('/classes'),
        axios.get('/academic-years')
      ]);
      
      setTeachers(teachersRes.data);
      setSubjects(subjectsRes.data);
      setClasses(classesRes.data);
      setAcademicYears(academicYearsRes.data);
      
      // For now, we'll simulate assignments since the backend doesn't have this endpoint yet
      // This would be replaced with actual API call: axios.get('/teaching-assignments')
      setAssignments([]);
      
    } catch (error) {
      console.error('Error fetching data:', error);
      showNotification('Gagal memuat data', 'error');
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
      weekly_hours: parseInt(formData.weekly_hours)
    };

    try {
      // Simulate API call for now
      const newAssignment = {
        id: Date.now().toString(),
        ...submitData,
        created_at: new Date().toISOString()
      };

      if (editingAssignment) {
        setAssignments(prev => prev.map(a => 
          a.id === editingAssignment.id ? { ...editingAssignment, ...submitData } : a
        ));
        showNotification('Pembagian tugas berhasil diperbarui', 'success');
      } else {
        setAssignments(prev => [...prev, newAssignment]);
        showNotification('Pembagian tugas berhasil ditambahkan', 'success');
      }
      
      handleCloseModal();
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Terjadi kesalahan';
      setError(errorMessage);
      showNotification(errorMessage, 'error');
    }
  };

  const handleEdit = (assignment) => {
    setEditingAssignment(assignment);
    setFormData({
      teacher_id: assignment.teacher_id,
      subject_id: assignment.subject_id,
      class_id: assignment.class_id,
      academic_year_id: assignment.academic_year_id,
      weekly_hours: assignment.weekly_hours.toString()
    });
    setShowModal(true);
  };

  const handleDelete = async (assignmentId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus pembagian tugas ini?')) {
      try {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
        showNotification('Pembagian tugas berhasil dihapus', 'success');
      } catch (error) {
        showNotification('Gagal menghapus pembagian tugas', 'error');
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingAssignment(null);
    setFormData({
      teacher_id: '',
      subject_id: '',
      class_id: '',
      academic_year_id: '',
      weekly_hours: ''
    });
    setError('');
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Helper functions
  const getTeacherName = (teacherId) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Guru tidak ditemukan';
  };

  const getSubjectName = (subjectId) => {
    const subject = subjects.find(s => s.id === subjectId);
    return subject ? subject.name : 'Mata pelajaran tidak ditemukan';
  };

  const getClassName = (classId) => {
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.name : 'Kelas tidak ditemukan';
  };

  const getAcademicYearName = (academicYearId) => {
    const academicYear = academicYears.find(ay => ay.id === academicYearId);
    return academicYear ? `${academicYear.school_year} - ${academicYear.semester}` : 'Tahun akademik tidak ditemukan';
  };

  // Calculate teacher workload
  const getTeacherWorkload = (teacherId) => {
    const teacherAssignments = assignments.filter(a => a.teacher_id === teacherId);
    const totalHours = teacherAssignments.reduce((sum, a) => sum + a.weekly_hours, 0);
    
    const minHours = 24; // Minimum teaching hours per week
    const maxHours = 40; // Maximum teaching hours per week
    
    let status = 'normal';
    let color = 'text-green-400';
    
    if (totalHours < minHours) {
      status = 'kurang';
      color = 'text-yellow-400';
    } else if (totalHours > maxHours) {
      status = 'berlebih';
      color = 'text-red-400';
    }
    
    return { totalHours, status, color, assignments: teacherAssignments };
  };

  const activeAcademicYear = academicYears.find(ay => ay.is_active);

  // Group assignments by teacher
  const assignmentsByTeacher = teachers.map(teacher => ({
    ...teacher,
    workload: getTeacherWorkload(teacher.id)
  }));

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
        <h1 className="text-3xl font-bold text-white mb-2">Pembagian JTM (Jam Tatap Muka)</h1>
        <p className="text-gray-400">Kelola pembagian jam mengajar guru untuk setiap mata pelajaran dan kelas</p>
        
        {activeAcademicYear && (
          <div className="mt-4 inline-flex items-center space-x-2 bg-blue-600/20 text-blue-300 px-3 py-1 rounded-full text-sm">
            <Calendar className="w-4 h-4" />
            <span>Tahun Aktif: {activeAcademicYear.school_year} - {activeAcademicYear.semester}</span>
          </div>
        )}
      </div>

      {!activeAcademicYear && (
        <div className="bg-yellow-600/20 border border-yellow-600/50 rounded-lg p-4 mb-6">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-400" />
            <div>
              <h3 className="font-semibold text-yellow-300">Tahun Akademik Belum Aktif</h3>
              <p className="text-yellow-200 text-sm">
                Silakan aktifkan tahun akademik terlebih dahulu di menu Data Master → Tahun Akademik
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
        <div className="lg:col-span-1">
          <div className="card p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Ringkasan</h3>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Pembagian</span>
                <span className="text-2xl font-bold text-white">{assignments.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Guru</span>
                <span className="text-2xl font-bold text-emerald-400">{teachers.length}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Mata Pelajaran</span>
                <span className="text-lg font-semibold text-white">{subjects.length}</span>
              </div>
              
              <div className="pt-4 border-t border-slate-700">
                <button
                  onClick={() => setShowModal(true)}
                  className="w-full btn-primary flex items-center justify-center space-x-2"
                  disabled={!activeAcademicYear}
                >
                  <Plus className="w-4 h-4" />
                  <span>Tambah Pembagian</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="card p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">Beban Kerja Guru</h2>
                  <p className="text-gray-400 text-sm">Monitoring jam mengajar setiap guru</p>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-400">Memuat data...</p>
              </div>
            ) : teachers.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Belum Ada Data Guru</h3>
                <p className="text-gray-400 mb-6">Tambahkan data guru terlebih dahulu di menu Data Master</p>
              </div>
            ) : (
              <div className="space-y-4">
                {assignmentsByTeacher.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="bg-slate-700 rounded-lg p-4 hover:bg-slate-600 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                          <User className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-white">{teacher.name}</h4>
                          <p className="text-sm text-gray-400">{teacher.nip_nuptk}</p>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className={`text-lg font-bold ${teacher.workload.color}`}>
                          {teacher.workload.totalHours} JP
                        </div>
                        <div className="text-xs text-gray-400">
                          {teacher.workload.status === 'kurang' && 'Kurang dari 24 JP'}
                          {teacher.workload.status === 'normal' && 'Sesuai standar'}
                          {teacher.workload.status === 'berlebih' && 'Melebihi 40 JP'}
                        </div>
                      </div>
                    </div>
                    
                    {teacher.workload.assignments.length > 0 ? (
                      <div className="space-y-2">
                        {teacher.workload.assignments.map((assignment) => (
                          <div
                            key={assignment.id}
                            className="flex items-center justify-between bg-slate-800 rounded p-3"
                          >
                            <div className="flex items-center space-x-3">
                              <BookOpen className="w-4 h-4 text-gray-400" />
                              <div>
                                <span className="text-white font-medium">
                                  {getSubjectName(assignment.subject_id)}
                                </span>
                                <span className="text-gray-400 mx-2">•</span>
                                <span className="text-gray-300">
                                  {getClassName(assignment.class_id)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 text-emerald-400">
                                <Clock className="w-4 h-4" />
                                <span className="font-semibold">{assignment.weekly_hours} JP</span>
                              </div>
                              
                              <div className="flex items-center space-x-1">
                                <button
                                  onClick={() => handleEdit(assignment)}
                                  className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 rounded transition-colors"
                                  title="Edit"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDelete(assignment.id)}
                                  className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-colors"
                                  title="Hapus"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4">
                        <p className="text-gray-400 text-sm">Belum ada pembagian tugas mengajar</p>
                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, teacher_id: teacher.id }));
                            setShowModal(true);
                          }}
                          className="mt-2 text-emerald-400 hover:text-emerald-300 text-sm"
                          disabled={!activeAcademicYear}
                        >
                          + Tambah Pembagian
                        </button>
                      </div>
                    )}
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
                {editingAssignment ? 'Edit Pembagian Tugas' : 'Tambah Pembagian Tugas'}
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
                    Guru <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="teacher_id"
                    value={formData.teacher_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih guru</option>
                    {teachers.map(teacher => (
                      <option key={teacher.id} value={teacher.id}>
                        {teacher.name} - {teacher.major}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Mata Pelajaran <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="subject_id"
                    value={formData.subject_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih mata pelajaran</option>
                    {subjects.map(subject => (
                      <option key={subject.id} value={subject.id}>
                        {subject.name} ({subject.code}) - {subject.time_allocation} JP
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Kelas <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="class_id"
                    value={formData.class_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih kelas</option>
                    {classes.map(classData => (
                      <option key={classData.id} value={classData.id}>
                        {classData.name} (Tingkat {classData.level})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Tahun Akademik <span className="text-red-400">*</span>
                  </label>
                  <select
                    name="academic_year_id"
                    value={formData.academic_year_id}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="">Pilih tahun akademik</option>
                    {academicYears.map(year => (
                      <option key={year.id} value={year.id}>
                        {year.school_year} - {year.semester}
                        {year.is_active && ' (Aktif)'}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Jam Per Minggu <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    name="weekly_hours"
                    value={formData.weekly_hours}
                    onChange={handleInputChange}
                    className="form-input"
                    placeholder="Contoh: 4"
                    min="1"
                    max="20"
                    required
                  />
                  <p className="text-gray-400 text-xs mt-1">
                    Jumlah jam pelajaran per minggu untuk mata pelajaran ini di kelas tersebut
                  </p>
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
                  <span>{editingAssignment ? 'Perbarui' : 'Simpan'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeachingAssignmentManagement;