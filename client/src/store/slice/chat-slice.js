export const createChatSlice = (set, get) => ({
  // Stores the type of the currently selected chat (e.g., "group", "direct", etc.)
  selectedChatType: undefined,
  // Stores the data of the currently selected chat (e.g., chat ID, participants, etc.)
  selectedChatData: undefined,
  // Stores the messages of the currently selected chat
  selectedChatMessages: [],
  directMessagesContacts: [],
  isUploading: false,
  isDownloading: false,
  fileUploadProgress: 0,
  fileDownloadProgress: 0,
  setIsUploading: (isUploading) => set({ isUploading }),
  setIsDownloading: (isDownloading) => set({ isDownloading }),
  setFileUploadProgress: (fileUploadProgress) => set({ fileUploadProgress }),
  setFileDownloadProgress: (fileDownloadProgress) =>
    set({ fileDownloadProgress }),
  // Setter to update the selected chat type
  setSelectedChatType: (selectedChatType) => set({ selectedChatType }),
  // Setter to update the selected chat data
  setSelectedChatData: (selectedChatData) => set({ selectedChatData }),
  // Setter to update the messages of the selected chat
  setSelectedChatMessages: (selectedChatMessages) =>
    set({ selectedChatMessages }),
  setDirectMessagesContacts: (directMessagesContacts) =>
    set({ directMessagesContacts }),
  // Resets all chat-related state (used when closing or switching chats)
  closeChat: () =>
    set({
      selectedChatData: undefined,
      selectedChatType: undefined,
      selectedChatMessages: [],
    }),
  // Zustand action to add a new message to the selected chat's message list
  addMessage: (message) => {
    const selectedChatMessages = get().selectedChatMessages; // Get existing messages
    const selectedChatType = get().selectedChatType; // Get the type of chat (user or channel)

    set({
      selectedChatMessages: [
        ...selectedChatMessages, // Preserve existing messages
        {
          ...message, // Add the new message
          // Normalize sender/recipient based on chat type
          recipient:
            selectedChatType === "channel"
              ? message.recipient // Keep as object in case of channel
              : message.recipient._id, // Extract ID for direct messages
          sender:
            selectedChatType === "channel"
              ? message.sender
              : message.sender._id,
        },
      ],
    });
  },
});
