// This function creates a slice of the Zustand store for authentication-related state.
export const createAuthSlice = (set) => ({
  // `userInfo` will hold the currently logged-in user's data (can be undefined or an object).
  userInfo: undefined,

  // `setUserInfo` is an action (a function) that updates the `userInfo` in the store.
  // It uses the Zustand `set` function to update state.
  setUserInfo: (userInfo) => set({ userInfo }),
});
