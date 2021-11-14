import { hash, compare } from "bcrypt";

import { SALT_ROUNDS } from "../utils/constants/general";

const securityService = {
  hashPassword: (password: string): Promise<string> => {
    return new Promise<string>((resolve, reject) => {
      hash(password, SALT_ROUNDS, (err, h) => {
        if (err) reject(err);
        else resolve(h);
      });
    });
  },
};

export default securityService;
