import { CookieOptions } from "express";
import { SignOptions } from "jsonwebtoken";

export const SALT_ROUNDS = 10;
export const MAX_AUTHCODE_TRIES = 3;

export const AUTH = {
  SIGNIN_KEYS: ["username", "password"],
  SIGNUP_KEYS: ["username", "email", "password"],
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
