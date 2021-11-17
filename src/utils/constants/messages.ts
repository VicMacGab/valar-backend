export const USER = {
  SUCCESS: {
    CREATION: "User created successfully!",
    FOUND: "User found successfully!",
    SIGNIN: "Signed in succesfully!",
    AUTH: "Authentication was successful.",
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

export const JWT = {
  EXPIRED: "El token expiró.",
  MALFORMED: "El token es inválido.",
  NOT_ACTIVE: "El token todavía no es válido.",
  SIGN: "Error al crear el JWT.",
};
