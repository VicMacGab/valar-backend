export const USER = {
  SUCCESS: {
    CREATION: "User created successfully!",
    FOUND: "User found successfully!", 
  },
  ERROR: {
    CREATION: "Error when creating user.",
    NOTFOUND: "User not found.",
    BADREQUEST: "Required field username missing.",
    USERNAMECONFLICT: "An account with that username already exists.",
    EMAILCONFLICT: "An account with that email already exists.",
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
