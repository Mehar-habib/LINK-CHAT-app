import { create } from "zustand";
import { createAuthSlice } from "./slice/auth-slice";
import { createChatSlice } from "./slice/chat-slice";

// Creating a global Zustand store called `useAppStore`
// We use a functional approach to compose slices — here only the auth slice is included
export const useAppStore = create((...a) => ({
  ...createAuthSlice(...a), // Spreads the returned state and actions from auth slice into the store
  ...createChatSlice(...a),
}));
