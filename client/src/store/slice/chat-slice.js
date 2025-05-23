export const createChatSlice = (set) => ({
  // Stores the type of the currently selected chat (e.g., "group", "direct", etc.)
  selectedChatType: undefined,
  // Stores the data of the currently selected chat (e.g., chat ID, participants, etc.)
  selectedChatData: undefined,
  // Stores the messages of the currently selected chat
  selectedChatMessages: [],
  // Setter to update the selected chat type
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  // Setter to update the selected chat data
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  // Setter to update the messages of the selected chat
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  // Resets all chat-related state (used when closing or switching chats)
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),
});
