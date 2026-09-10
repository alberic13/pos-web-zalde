import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRole, UserRole } from '../../context/RoleContext';
import { api } from '../../lib/api';
import { getErrorMessage } from '../../utils/error';

export function useLogin() {
  const { loginSuccess } = useRole();
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const redirectByRole = (role: string) => {
    if (role === 'GUDANG') return '/inventory';
    if (role === 'KASIR') return '/pos';
    return '/';
  };

  const handleLogin = async (e?: React.FormEvent, customRole?: UserRole) => {
    if (e) e.preventDefault();
    setErrorMessage(null);
    setLoading(true);

    try {
      if (customRole) {
        const res = await api.login({ role: customRole });
        if (res && res.user) {
          loginSuccess(res.user.role as UserRole, res.user.name, res.token);
          navigate(redirectByRole(res.user.role));
          return;
        }
      }

      const res = await api.login({ username, password });
      if (res && res.user) {
        loginSuccess(res.user.role as UserRole, res.user.name, res.token);
        navigate(redirectByRole(res.user.role));
      }
    } catch (err: unknown) {
      setErrorMessage(getErrorMessage(err) || 'Login gagal. Pastikan username & password benar.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdminLogin = () => handleLogin(undefined, 'ADMIN');

  return {
    username,
    setUsername,
    password,
    setPassword,
    loading,
    errorMessage,
    handleLogin,
    handleQuickAdminLogin,
  };
}
