import { MAX_AUTHCODE_TRIES } from "../utils/constants/general";
import mailService from "./mailService";

class twoFactorService {
  // TODO: cambiarlo a que sea un Map ya que es más rápido
  authCodes: Record<string, [number, number]> = {};
  timers: Record<string, NodeJS.Timeout> = {};
  // authCodes: Map<string, [number, number]> = new Map();
  // timers: Map<string, NodeJS.Timeout> = new Map();

  constructor() {}

  async createCode(
    username: string,
    email: string,
    code: number
  ): Promise<void | any> {
    // si pidió el 2 factor de nuevo, resetear el countdown
    if (this.authCodes[username]) {
      clearTimeout(this.timers[username]);
    }

    // asociar el codigo al username
    this.authCodes[username] = [code, 0];

    console.log(`created code ${code} for username ${username}`);

    console.log(`Email to: ${email}`);

    try {
      await mailService.sendCode(email, code);
    } catch (error) {
      return error;
    }

    // setear el countdown
    this.timers[username] = setTimeout(() => {
      if (this.authCodes[username]) {
        delete this.authCodes[username];
      }
      console.log(`deleted code ${code} for username ${username}`);
    }, 120 * 1000); // válido por 2 minutos nomas
  }

  verifyAuthCode(username: string, code: number): [boolean, boolean] {
    console.log(`verify ${this.authCodes[username]} == ${code}`);
    const aux = this.authCodes[username];

    // el codigo expiró
    if (aux === undefined || aux[1]++ >= MAX_AUTHCODE_TRIES) {
      return [false, true];
    }

    // si hacen match, borrar el codigo
    if (aux[0] == code) {
      delete this.authCodes[username];
      return [true, false];
    }

    // si no hacen match, no borrar el codigo ya que podría intentar nuevamente
    else {
      return [false, false];
    }
  }
}

export default new twoFactorService();
