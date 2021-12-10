import { CookieOptions } from "express";

export const SALT_ROUNDS = 10;
export const MAX_AUTHCODE_TRIES = 3;
export const DH_KEY_SIZE = 2048;
export const MAX_PASSWORD_SIZE = 64;
export const MAX_USERNAME_SIZE = 32;
export const MAX_EMAIL_SIZE = 254;

export const AUTH = {
  SIGNIN_KEYS: ["username", "password"],
  SIGNUP_KEYS: ["username", "email", "password"],
};

export const REQUESTS = {
  SEND_KEYS: ["username"],
  ACCEPT_KEYS: ["username"],
  DECLINE_KEYS: ["username"],
};

export const INVALID_BODY = "Invalid body";

export const COOKIE_OPTIONS_2FACTOR: CookieOptions = {
  httpOnly: true, // document.cookie no puede acceder a ella
  secure: true, //  solo se manda por HTTPS a menos que sea localhost
  maxAge: 120 * 1000, //  no son exactamente 2 minutos, pero por ahí
};

export const COOKIE_OPTIONS_SESSION: CookieOptions = {
  httpOnly: true,
  secure: true,
  signed: true,
  // no maxAge por ahora
};

export const MIN_AUTHCODE_NUM = 1000;
export const MAX_AUTHCODE_NUM = 9999;

export const SENDGRID_SUBJECT = "Valar Two-Factor Authentication";
