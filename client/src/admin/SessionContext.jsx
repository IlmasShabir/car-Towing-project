import { createContext, useContext, useEffect, useState } from 'react';
import { getCurrentAdmin } from '../api/adminApi';

const AdminSessionContext = createContext(null);

export const AdminSessionProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCurrentAdmin()
      .then(setUser)
      .catch(() => {
        // Token invalid/expired — the axios interceptor surfaces the error;
        // ProtectedAdminRoute will bounce the user back to login on reload.
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminSessionContext.Provider value={{ user, setUser, loading }}>
      {children}
    </AdminSessionContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAdminSession = () => {
  const context = useContext(AdminSessionContext);
  if (!context) {
    throw new Error('useAdminSession must be used within an AdminSessionProvider');
  }
  return context;
};