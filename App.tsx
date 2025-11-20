import React, { useState, useEffect } from 'react';
import { LayoutDashboard, List, PlusCircle, Menu, X, LogOut } from 'lucide-react';
import Dashboard from './components/Dashboard';
import AddDevice from './components/AddDevice';
import DeviceCard from './components/DeviceCard';
import Auth from './components/Auth';
import SetupGuide from './components/SetupGuide';
import { getDevices, deleteDevice } from './services/storageService';
import { auth, isConfigured } from './services/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { ViewState, Device } from './types';

const App: React.FC = () => {
  const [user, setUser] = useState<any>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const [view, setView] = useState<ViewState>('dashboard');
  const [devices, setDevices] = useState<Device[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // If keys are placeholders, don't attempt auth check
    if (!isConfigured || !auth) {
      setLoadingAuth(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
      if (currentUser) {
        refreshDevices();
      } else {
        setDevices([]);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (user) {
      refreshDevices();
    }
  }, [view, user]);

  const refreshDevices = async () => {
    if (!user) return;
    setLoadingData(true);
    try {
      const data = await getDevices();
      setDevices(data);
    } catch (error) {
      console.error("Error loading devices", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this device?')) {
      await deleteDevice(id);
      refreshDevices();
    }
  };

  const handleSignOut = async () => {
    if (auth) await signOut(auth);
  };

  const filteredDevices = devices.filter(d => 
    d.brand_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    (d.category && d.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // 1. SHOW SETUP GUIDE IF KEYS ARE MISSING
  if (!isConfigured) {
    return <SetupGuide />;
  }

  if (loadingAuth) {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans pb-20 md:pb-0">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:inset-y-0 md:flex md:w-64 md:flex-col md:border-r md:border-gray-200 md:bg-white z-10">
        <div className="flex h-16 items-center gap-2 border-b border-gray-200 px-6">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
          <span className="text-lg font-bold text-gray-900">WarrantyGuard</span>
        </div>
        <nav className="flex-1 space-y-1 px-3 py-4">
          <button 
            onClick={() => setView('dashboard')}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${view === 'dashboard' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <LayoutDashboard size={20} />
            Dashboard
          </button>
          <button 
            onClick={() => setView('list')}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${view === 'list' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <List size={20} />
            My Devices
          </button>
           <button 
            onClick={() => setView('add')}
            className={`group flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${view === 'add' ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700 hover:bg-gray-100'}`}
          >
            <PlusCircle size={20} />
            Add Device
          </button>
        </nav>
        <div className="border-t border-gray-200 p-4">
            <div className="flex items-center justify-between gap-3 rounded-lg bg-gray-50 p-3">
                <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 flex-shrink-0 flex items-center justify-center text-indigo-600 text-xs font-bold">
                        {user.email ? user.email[0].toUpperCase() : 'U'}
                    </div>
                    <div className="text-xs truncate">
                        <p className="font-medium text-gray-900 truncate">{user.displayName || 'User'}</p>
                        <p className="text-gray-500 truncate">{user.email}</p>
                    </div>
                </div>
                <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors">
                    <LogOut size={18} />
                </button>
            </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-20 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">W</div>
            <span className="text-lg font-bold text-gray-900">WarrantyGuard</span>
          </div>
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="text-gray-600">
              {mobileMenuOpen ? <X /> : <Menu />}
          </button>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
          <div className="fixed inset-0 bg-white z-10 pt-20 px-6 space-y-4 md:hidden">
              <button 
                onClick={() => { setView('dashboard'); setMobileMenuOpen(false); }}
                className="flex w-full items-center gap-4 p-4 bg-gray-50 rounded-xl text-lg font-medium text-gray-800"
              >
                <LayoutDashboard /> Dashboard
              </button>
              <button 
                onClick={() => { setView('list'); setMobileMenuOpen(false); }}
                className="flex w-full items-center gap-4 p-4 bg-gray-50 rounded-xl text-lg font-medium text-gray-800"
              >
                <List /> My Devices
              </button>
              <button 
                onClick={() => { setView('add'); setMobileMenuOpen(false); }}
                className="flex w-full items-center gap-4 p-4 bg-gray-50 rounded-xl text-lg font-medium text-gray-800"
              >
                <PlusCircle /> Add Device
              </button>
              <button 
                onClick={handleSignOut}
                className="flex w-full items-center gap-4 p-4 bg-red-50 text-red-600 rounded-xl text-lg font-medium"
              >
                <LogOut /> Sign Out
              </button>
          </div>
      )}

      {/* Main Content */}
      <main className="md:pl-64 pt-20 md:pt-8 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 capitalize">
                {view === 'dashboard' && 'Overview'}
                {view === 'list' && 'My Devices'}
                {view === 'add' && 'Scan New Device'}
            </h1>
            <p className="text-gray-500">
                {view === 'dashboard' && 'Track your appliance warranties and service schedules.'}
                {view === 'list' && 'Manage all your registered appliances.'}
                {view === 'add' && 'Use AI to extract details from bills or warranty cards.'}
            </p>
        </div>

        {view === 'dashboard' && <Dashboard devices={devices} loading={loadingData} />}
        
        {view === 'add' && (
          <div className="max-w-2xl mx-auto">
            <AddDevice 
                onComplete={() => setView('list')} 
                onCancel={() => setView('dashboard')} 
            />
          </div>
        )}

        {view === 'list' && (
            <div className="space-y-6">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Search brands or categories..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none shadow-sm"
                    />
                </div>
                
                {loadingData ? (
                    <div className="flex justify-center py-12">
                         <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredDevices.length > 0 ? (
                            filteredDevices.map(device => (
                                <DeviceCard key={device.id} device={device} onDelete={handleDelete} />
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-gray-400">
                                {searchTerm ? 'No devices match your search.' : 'No devices added yet. Click "Add Device" to start.'}
                            </div>
                        )}
                    </div>
                )}
            </div>
        )}
      </main>

      {/* Mobile Bottom Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-6 py-3 flex justify-between items-center z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        <button 
            onClick={() => setView('dashboard')}
            className={`flex flex-col items-center gap-1 ${view === 'dashboard' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
            <LayoutDashboard size={24} />
            <span className="text-[10px] font-medium">Home</span>
        </button>
        <button 
             onClick={() => setView('add')}
             className="flex items-center justify-center w-12 h-12 bg-indigo-600 rounded-full text-white shadow-lg shadow-indigo-200 -mt-6 border-4 border-gray-50"
        >
            <PlusCircle size={24} />
        </button>
        <button 
            onClick={() => setView('list')}
            className={`flex flex-col items-center gap-1 ${view === 'list' ? 'text-indigo-600' : 'text-gray-400'}`}
        >
            <List size={24} />
            <span className="text-[10px] font-medium">Devices</span>
        </button>
      </div>
    </div>
  );
};

export default App;