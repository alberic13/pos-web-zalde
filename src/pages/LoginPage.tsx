import React from 'react';
import { useLogin } from '../components/auth/useLogin';
import { System7TopMenuBar } from '../components/auth/System7TopMenuBar';
import { LoginFormCard } from '../components/auth/LoginFormCard';

export const LoginPage: React.FC = () => {
  const {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    errorMessage,
    handleLogin,
    handleQuickAdminLogin,
  } = useLogin();

  return (
    <div className="min-h-screen mac-pinstripe-bg flex items-center justify-center p-4 font-sans text-black relative overflow-hidden select-none">
      <System7TopMenuBar />

      <div className="w-full max-w-md mac-window p-0 z-10 shadow-2xl mt-6">
        <div className="mac-window-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <span className="w-3 h-3 rounded-full bg-red-500 border border-red-700 inline-block" />
              <span className="w-3 h-3 rounded-full bg-yellow-400 border border-yellow-600 inline-block" />
              <span className="w-3 h-3 rounded-full bg-green-500 border border-green-700 inline-block" />
            </div>
            <h2 className="text-xs font-black uppercase tracking-wide text-black">Welcome to POS Zalde</h2>
          </div>
          <span className="text-[10px] font-extrabold text-gray-700 uppercase">System 7.5.3</span>
        </div>

        <LoginFormCard
          username={username}
          setUsername={setUsername}
          password={password}
          setPassword={setPassword}
          loading={loading}
          errorMessage={errorMessage}
          onSubmit={handleLogin}
          onQuickAdminLogin={handleQuickAdminLogin}
          onQuickRoleLogin={(role) => handleLogin(undefined, role)}
        />

        <div className="p-2.5 border-t-2 border-black bg-gray-300 flex items-center justify-between text-[10px] font-black text-gray-800 uppercase">
          <span>© 1991-2026 Zalde POS</span>
          <span>System 7.0</span>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
