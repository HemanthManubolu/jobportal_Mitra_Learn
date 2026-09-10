import { useEffect } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { API_END_POINT } from '@/utils/constant';
import { clearAuth, setAuthInitialized, setUser } from '@/redux/authSlice';

// The browser cookie is the source of truth. Do not trust a persisted Redux user.
export default function AuthInitializer({ children }) {
  const dispatch = useDispatch();
  useEffect(() => {
    let active = true;
    axios.get(`${API_END_POINT}/auth/me`, { withCredentials: true })
      .then(({ data }) => { if (active && data.success) dispatch(setUser(data.user)); })
      .catch(() => { if (active) dispatch(clearAuth()); })
      .finally(() => { if (active) dispatch(setAuthInitialized(true)); });
    return () => { active = false; };
  }, [dispatch]);
  return children;
}
