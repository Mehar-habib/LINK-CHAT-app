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
  channels: [],
  setChannels: (channels) => set({ channels }),
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
  addChannel: (channel) => {
    const channels = get().channels;
    set({ channels: [...channel, channels] });
  },
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
  // Function to reorder the channel list when a new message is received
  addChannelInChannelList: (message) => {
    // Get the current list of channels from the store
    const channels = get().channels;

    // Find the channel object that matches the channelId from the message
    const data = channels.find((channel) => channel._id === message.channelId);

    // Find the index of that channel in the array
    const index = channels.findIndex(
      (channel) => channel._id === message.channelId
    );

    // If the channel exists in the list
    if (index !== -1 && index !== undefined) {
      // Remove the channel from its current position
      channels.splice(index, 1);

      // Add the channel back to the beginning of the array
      // This effectively moves the most recently active channel to the top
      channels.unshift(data);
    }
  },
  addContactsInDMContacts: (message) => {
    // Get the current user's ID from the global state
    const userId = get().userInfo.id;

    // Determine the ID of the person the user is chatting with (not themselves)
    const formId =
      message.sender._id === userId
        ? message.recipient._id
        : message.sender._id;

    // Get the full user data of the other person (sender or recipient)
    const formData =
      message.sender._id === userId ? message.recipient : message.sender;

    // Get the current list of direct message contacts from the store
    const dmContacts = get().directMessagesContacts;

    // Try to find if this contact already exists in the list
    const data = dmContacts.find((contact) => contact._id === formId);

    // Get the index of that contact in the list
    const index = dmContacts.findIndex((contact) => contact._id === formId);

    // If contact exists, remove it from its current position and move it to the top
    if (index !== -1 && index !== undefined) {
      dmContacts.splice(index, 1);
      dmContacts.unshift(data);
    } else {
      // If contact does not exist, add it to the top of the list
      dmContacts.unshift(formData);
    }

    // Update the state with the modified contacts list
    set({ directMessagesContacts: dmContacts });
  },
});
