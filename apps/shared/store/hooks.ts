import {
  useDispatch,
  useSelector,
  type TypedUseSelectorHook,
} from "react-redux";

/**
 * Create typed Redux hooks for an app store.
 * Usage:
 *   type AppDispatch = typeof store.dispatch;
 *   type RootState = ReturnType<typeof store.getState>;
 *   export const { useAppDispatch, useAppSelector } = createTypedHooks<RootState, AppDispatch>();
 */
export function createTypedHooks<
  RootState,
  AppDispatch extends (...args: unknown[]) => unknown,
>() {
  const useAppDispatch = () => useDispatch<AppDispatch>();
  const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
  return { useAppDispatch, useAppSelector } as const;
}
