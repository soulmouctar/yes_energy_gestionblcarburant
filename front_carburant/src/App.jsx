import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';

import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BlList from './pages/BlList';
import CamionsList from './pages/CamionsList';
import ChauffeursList from './pages/ChauffeursList';
import ClientsList from './pages/ClientsList';
import DestinationsList from './pages/DestinationsList';
import TransporteursList from './pages/TransporteursList';
import Liquidations from './pages/Liquidations';
import Rapports from './pages/Rapports';
import AuditLogs from './pages/AuditLogs';
import UsersList from './pages/UsersList';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-slate-950 text-slate-100 font-sans transition-colors duration-200 overflow-hidden">
      {/* Fixed Sidebar */}
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      {/* Main Content Area (Independent Scroll) */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <Navbar onToggleSidebar={() => setIsSidebarOpen(prev => !prev)} />
        <main className="flex-1 p-4 sm:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Route */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes inside AppLayout */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/bl" element={<BlList />} />
                <Route path="/liquidations" element={<Liquidations />} />
                <Route path="/camions" element={<CamionsList />} />
                <Route path="/chauffeurs" element={<ChauffeursList />} />
                <Route path="/clients" element={<ClientsList />} />
                <Route path="/destinations" element={<DestinationsList />} />
                <Route path="/transporteurs" element={<TransporteursList />} />
                <Route path="/rapports" element={<Rapports />} />

                {/* Admin Only Routes */}
                <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                  <Route path="/audit-logs" element={<AuditLogs />} />
                  <Route path="/users" element={<UsersList />} />
                </Route>
              </Route>
            </Route>

            {/* Catch-all redirect */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
