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
  SEND_KEYS: ["username", "pubKey", "p", "g"],
  ACCEPT_KEYS: ["username"],
  DECLINE_KEYS: ["username"],
  SEND_PUB_PART_KEYS: ["friendUsername", "pubKey", "p", "g"],
  FINISH_KEYS: ["friendUsername", "friendId"],
};

export const INVALID_BODY = "Invalid body";

/*
If the domain associated with a cookie matches an external 
service and not the website in the user's address bar, 
this is considered a cross-site (or "third party") context.
*/

// FIXME: le pusimos samesite 'none' porq el front y el back no tienen el mismo dominio (deberían para q sea más seguro)

export const COOKIE_OPTIONS_2FACTOR: CookieOptions = {
  httpOnly: true, // document.cookie no puede acceder a ella
  secure: true, //  solo se manda por HTTPS a menos que sea localhost
  maxAge: 120 * 1000, //  no son exactamente 2 minutos, pero por ahí
  sameSite: "strict",
  domain: process.env.NODE_ENV == "production" ? "cliffdev.com" : "localhost",
  path: "/",
};

export const COOKIE_OPTIONS_SESSION: CookieOptions = {
  httpOnly: true,
  secure: true,
  signed: true,
  sameSite: "lax",
  domain: process.env.NODE_ENV == "production" ? "cliffdev.com" : "localhost",
  path: "/",
};

export const MIN_AUTHCODE_NUM = 1000;
export const MAX_AUTHCODE_NUM = 9999;

export const SENDGRID_SUBJECT = "Valar Two-Factor Authentication";
