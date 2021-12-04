export const USER = {
  SUCCESS: {
    CREATION: "User created successfully!",
    FOUND: "User found successfully!",
    SIGNIN: "Signed in succesfully!",
    AUTH: "Authentication was successful.",
    LOGOUT: "Successfully logged out.",
    DECLINED: "Successfully declined request.",
    SENT: "Successfully sent request.",
  },
  ERROR: {
    CREATION: "Error when creating user.",
    NOT_FOUND: "User not found.",
    BAD_REQUEST: "Required field username missing.",
    USERNAME_CONFLICT: "An account with that username already exists.",
    EMAIL_CONFLICT: "An account with that email already exists.",
    GENERIC: "Error when searching for user.",
    PASSWORD: "Error when hashing password.",
    SIGNIN: "Incorrect username or password.",
    AUTH_CODE: "Auth code is missing.",
    AUTH_CODE_EXPIRED: "Auth code expired.",
    NOT_LOGGED_IN: "User is not logged in.",
    TAMPERED_COOKIE: "Session cookie was tampered.",
  },
};

export const CHAT = {
  SUCCESS: {
    CREATION: "Chat successfully created!",
  },
  ERROR: {
    CREATION: "Error when creating chat!",
    GENERIC: "Error when searching for all chats!.",
  },
};

export const JWT = {
  EXPIRED: "El token expiró.",
  MALFORMED: "El token es inválido.",
  NOT_ACTIVE: "El token todavía no es válido.",
  SIGN: "Error al crear el JWT.",
};

export const AUTHCODE = {
  SENT: "Your auth code was sent to your email.",
  MATCHED: "Code matched",
  INCORRECT: "Incorrect code",
  EXPIRED: "Code expired",
};

export const MIDDLEWARE = {
  NOT_ALLOWED: "You're not allowed to access this route.",
};
