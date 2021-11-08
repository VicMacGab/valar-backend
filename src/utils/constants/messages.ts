export const USER = {
  SUCCESS: {
    CREATION: "User created successfully!",
    FOUND: "User found successfully!",
  },
  ERROR: {
    CREATION: "Error when creating user.",
    NOT_FOUND: "User not found.",
    BAD_REQUEST: "Required field username missing.",
    USERNAME_CONFLICT: "An account with that username already exists.",
    EMAIL_CONFLICT: "An account with that email already exists.",
    GENERIC: "Error when searching user.",
  },
};

export const CHAT = {
  SUCCESS: {
    CREATION: "Chat successfully created!",
  },
  ERROR: {
    CREATION: "Error when creating chat!",
  },
};
