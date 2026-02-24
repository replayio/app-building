import { useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setUser, clearUser, setLoading, type AuthUser, type AuthState } from "./authSlice";

interface AuthRootState {
  auth: AuthState;
}

/**
 * Hook for accessing and managing authentication state.
 * Requires authReducer to be mounted at state.auth in the store.
 */
export function useAuth() {
  const dispatch = useDispatch();
  const { user, isAuthenticated, isLoading } = useSelector(
    (state: AuthRootState) => state.auth
  );

  const login = useCallback(
    (userData: AuthUser) => {
      dispatch(setUser(userData));
    },
    [dispatch]
  );

  const logout = useCallback(() => {
    dispatch(clearUser());
  }, [dispatch]);

  const setAuthLoading = useCallback(
    (loading: boolean) => {
      dispatch(setLoading(loading));
    },
    [dispatch]
  );

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    setAuthLoading,
  } as const;
}
