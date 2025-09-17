import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './App.css';
import SchoolManagement from './components/SchoolManagement';
import TeacherManagement from './components/TeacherManagement';
import SubjectManagement from './components/SubjectManagement';
import ClassManagement from './components/ClassManagement';
import AcademicYearManagement from './components/AcademicYearManagement';
import AdditionalTaskManagement from './components/AdditionalTaskManagement';
import TeachingAssignmentManagement from './components/TeachingAssignmentManagement';

// Icons from Lucide React
import { 
  Home, 
  Database, 
  School, 
  Users, 
  BookOpen, 
  Calendar, 
  ClipboardList, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  Search,
  Bell,
  User,
  Plus,
  Edit,
  Trash2,
  Save,
  Download,
  Upload
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Set default axios headers
axios.defaults.baseURL = API;

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('user') || 'null'));

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    delete axios.defaults.headers.common['Authorization'];
  };

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Login Component
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post('/auth/login', { username, password });
      login(response.data.access_token, response.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login gagal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 flex items-center justify-center p-4">
      <div className="bg-white/10 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-full max-w-md border border-white/20">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <School className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Adifathi Jadwal SK</h1>
          <p className="text-gray-300">Sistem Manajemen Jadwal Sekolah</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-red-300 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan username"
              required
            />
          </div>

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Masukkan password"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900"
          >
            {loading ? 'Memproses...' : 'Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center text-gray-400 text-sm">
          <p>Username: admin | Password: Adifathi2020</p>
        </div>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = ({ isOpen, onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { icon: Home, label: 'Dashboard', path: '/dashboard' },
    {
      icon: Database,
      label: 'Data Master',
      submenu: [
        { icon: School, label: 'Sekolah', path: '/master/schools' },
        { icon: Users, label: 'Guru', path: '/master/teachers' },
        { icon: BookOpen, label: 'Mata Pelajaran', path: '/master/subjects' },
        { icon: Calendar, label: 'Kelas', path: '/master/classes' },
        { icon: Calendar, label: 'Tahun Akademik', path: '/master/academic-years' },
        { icon: ClipboardList, label: 'Tugas Tambahan', path: '/master/additional-tasks' },
      ]
    },
    {
      icon: ClipboardList,
      label: 'Pembagian Tugas',
      submenu: [
        { icon: BookOpen, label: 'Pembagian JTM', path: '/assignments/teaching' },
        { icon: ClipboardList, label: 'Tugas Tambahan', path: '/assignments/additional' },
        { icon: FileText, label: 'Rincian Tugas', path: '/assignments/details' },
      ]
    },
    {
      icon: Calendar,
      label: 'Jadwal Pelajaran',
      submenu: [
        { icon: Calendar, label: 'Template Jadwal', path: '/schedule/templates' },
        { icon: Plus, label: 'Buat Jadwal', path: '/schedule/create' },
        { icon: Edit, label: 'Kelola Jadwal', path: '/schedule/manage' },
      ]
    },
    {
      icon: FileText,
      label: 'Dokumen SK',
      submenu: [
        { icon: FileText, label: 'Template SK', path: '/documents/templates' },
        { icon: Plus, label: 'Buat SK', path: '/documents/create' },
        { icon: FileText, label: 'Arsip SK', path: '/documents/archive' },
      ]
    },
    { icon: Settings, label: 'Pengaturan', path: '/settings' },
  ];

  const [openSubmenu, setOpenSubmenu] = useState(null);

  const handleMenuClick = (item, index) => {
    if (item.submenu) {
      setOpenSubmenu(openSubmenu === index ? null : index);
    } else {
      navigate(item.path);
      onClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-64 bg-slate-900 border-r border-slate-700 z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-slate-700">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <School className="w-5 h-5 text-white" />
            </div>
            <span className="text-white font-semibold">Adifathi SK</span>
          </div>
          <button onClick={onClose} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="p-4 space-y-2 overflow-y-auto h-full pb-20">
          {menuItems.map((item, index) => (
            <div key={index}>
              <button
                onClick={() => handleMenuClick(item, index)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  location.pathname === item.path
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.submenu && (
                  <div className={`transform transition-transform ${openSubmenu === index ? 'rotate-90' : ''}`}>
                    <span className="text-xs">▶</span>
                  </div>
                )}
              </button>

              {item.submenu && openSubmenu === index && (
                <div className="ml-4 mt-2 space-y-1">
                  {item.submenu.map((subItem, subIndex) => (
                    <button
                      key={subIndex}
                      onClick={() => {
                        navigate(subItem.path);
                        onClose();
                      }}
                      className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        location.pathname === subItem.path
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-400 hover:bg-slate-800 hover:text-white'
                      }`}
                    >
                      <subItem.icon className="w-4 h-4" />
                      <span className="text-sm">{subItem.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
};

// Header Component
const Header = ({ onMenuClick }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden text-gray-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari..."
              className="pl-10 pr-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
            />
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <button className="relative text-gray-400 hover:text-white">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="hidden md:block">
              <p className="text-white text-sm font-medium">{user?.name}</p>
              <p className="text-gray-400 text-xs">{user?.role}</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState({
    schools: 0,
    teachers: 0,
    subjects: 0,
    classes: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/dashboard/stats');
        setStats(response.data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: 'Total Sekolah', value: stats.schools, color: 'bg-blue-600', icon: School },
    { label: 'Total Guru', value: stats.teachers, color: 'bg-green-600', icon: Users },
    { label: 'Mata Pelajaran', value: stats.subjects, color: 'bg-purple-600', icon: BookOpen },
    { label: 'Kelas', value: stats.classes, color: 'bg-orange-600', icon: Calendar },
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Dashboard</h1>
        <p className="text-gray-400">Selamat datang di Sistem Manajemen Jadwal Sekolah</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <div key={index} className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">{card.label}</p>
                <p className="text-2xl font-bold text-white">{card.value}</p>
              </div>
              <div className={`w-12 h-12 ${card.color} rounded-lg flex items-center justify-center`}>
                <card.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Aksi Cepat</h3>
          <div className="grid grid-cols-2 gap-4">
            <button className="flex items-center space-x-3 p-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white transition-colors">
              <Plus className="w-5 h-5" />
              <span>Tambah Guru</span>
            </button>
            <button className="flex items-center space-x-3 p-3 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors">
              <Calendar className="w-5 h-5" />
              <span>Buat Jadwal</span>
            </button>
            <button className="flex items-center space-x-3 p-3 bg-purple-600 hover:bg-purple-700 rounded-lg text-white transition-colors">
              <FileText className="w-5 h-5" />
              <span>Buat SK</span>
            </button>
            <button className="flex items-center space-x-3 p-3 bg-orange-600 hover:bg-orange-700 rounded-lg text-white transition-colors">
              <BookOpen className="w-5 h-5" />
              <span>Mata Pelajaran</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
          <h3 className="text-lg font-semibold text-white mb-4">Aktivitas Terbaru</h3>
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">Sistem berhasil diinisialisasi</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">Database terhubung dengan baik</span>
            </div>
            <div className="flex items-center space-x-3">
              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300 text-sm">Siap untuk konfigurasi data master</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Placeholder Component for other pages
const PlaceholderPage = ({ title }) => {
  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
        <p className="text-gray-400">Halaman ini akan segera tersedia</p>
      </div>
      
      <div className="bg-slate-800 rounded-xl p-8 border border-slate-700 text-center">
        <div className="w-16 h-16 bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
          <Settings className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">Dalam Pengembangan</h3>
        <p className="text-gray-400">Fitur {title} sedang dalam tahap pengembangan dan akan segera tersedia.</p>
      </div>
    </div>
  );
};

// Main Layout Component
const Layout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-900">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      
      <div className="lg:ml-64">
        <Header onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
};

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { token } = useAuth();
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  return <Layout>{children}</Layout>;
};

// Main App Component
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          {/* Master Data Routes */}
          <Route path="/master/schools" element={
            <ProtectedRoute>
              <SchoolManagement />
            </ProtectedRoute>
          } />
          <Route path="/master/teachers" element={
            <ProtectedRoute>
              <TeacherManagement />
            </ProtectedRoute>
          } />
          <Route path="/master/subjects" element={
            <ProtectedRoute>
              <SubjectManagement />
            </ProtectedRoute>
          } />
          <Route path="/master/classes" element={
            <ProtectedRoute>
              <ClassManagement />
            </ProtectedRoute>
          } />
          <Route path="/master/academic-years" element={
            <ProtectedRoute>
              <AcademicYearManagement />
            </ProtectedRoute>
          } />
          <Route path="/master/additional-tasks" element={
            <ProtectedRoute>
              <AdditionalTaskManagement />
            </ProtectedRoute>
          } />
          
          {/* Assignment Routes */}
          <Route path="/assignments/teaching" element={
            <ProtectedRoute>
              <TeachingAssignmentManagement />
            </ProtectedRoute>
          } />
          <Route path="/assignments/additional" element={
            <ProtectedRoute>
              <PlaceholderPage title="Tugas Tambahan Guru" />
            </ProtectedRoute>
          } />
          <Route path="/assignments/details" element={
            <ProtectedRoute>
              <PlaceholderPage title="Rincian Tugas" />
            </ProtectedRoute>
          } />
          
          {/* Schedule Routes */}
          <Route path="/schedule/templates" element={
            <ProtectedRoute>
              <PlaceholderPage title="Template Jadwal" />
            </ProtectedRoute>
          } />
          <Route path="/schedule/create" element={
            <ProtectedRoute>
              <PlaceholderPage title="Buat Jadwal" />
            </ProtectedRoute>
          } />
          <Route path="/schedule/manage" element={
            <ProtectedRoute>
              <PlaceholderPage title="Kelola Jadwal" />
            </ProtectedRoute>
          } />
          
          {/* Document Routes */}
          <Route path="/documents/templates" element={
            <ProtectedRoute>
              <PlaceholderPage title="Template SK" />
            </ProtectedRoute>
          } />
          <Route path="/documents/create" element={
            <ProtectedRoute>
              <PlaceholderPage title="Buat SK" />
            </ProtectedRoute>
          } />
          <Route path="/documents/archive" element={
            <ProtectedRoute>
              <PlaceholderPage title="Arsip SK" />
            </ProtectedRoute>
          } />
          
          {/* Settings Route */}
          <Route path="/settings" element={
            <ProtectedRoute>
              <PlaceholderPage title="Pengaturan" />
            </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;