import express, { Request, Response, Router } from "express";
import { createDiffieHellman } from "crypto";

import ensureLoggedInMiddleware from "../middleware/ensureLoggedInMiddleware";

import userService from "../services/userService";
import logger from "../services/loggerService";

import Chat from "../models/Chat";

import { CHAT, USER } from "../utils/constants/messages";
import { validBody } from "../utils/validation/body";
import { REQUESTS } from "../utils/constants/general";
import { INVALID_BODY } from "../utils/constants/general";
import { DH_KEY_SIZE } from "../utils/constants/general";

const requestController: Router = express.Router();

requestController.use("/requests", ensureLoggedInMiddleware);

requestController.get("/requests/sent", async (req: Request, res: Response) => {
  const { valarSession } = req.signedCookies;
  const { username } = valarSession;
  try {
    const [, user] = await userService.findByUsernameOutgoing(username);
    return res.status(200).json({ outgoingRequests: user?.outgoingRequests });
  } catch (err) {
    return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
  }
});

requestController.get(
  "/requests/received",
  async (req: Request, res: Response) => {
    const { valarSession } = req.signedCookies;
    const { username } = valarSession;
    try {
      const [, user] = await userService.findByUsernameIncoming(username);
      return res.status(200).json({ incomingRequests: user?.incomingRequests });
    } catch (err) {
      return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
    }
  }
);

//TODO verificar que no se pueda mandar de nuevo si ya se mando 1 vez
requestController.post(
  "/requests/send",
  async (req: Request, res: Response) => {
    if (!validBody(req.body, REQUESTS.SEND_KEYS)) {
      return res.status(400).json({ msg: INVALID_BODY });
    }
    const { valarSession } = req.signedCookies;
    const { username } = valarSession;

    try {
      const p1 = userService.findByUsername(username);
      const p2 = userService.findByUsername(req.body.username);
      const [[outgoingFound, outgoingUser], [incomingFound, incomingUser]] =
        await Promise.all([p1, p2]);

      if (!outgoingFound || !incomingFound) {
        logger.error(
          "user sending the request or user receiving the request not found"
        );
        return res.status(404).json({ msg: USER.ERROR.NOT_FOUND });
      }

      // TODO: que corra en otro thread ya que ahorita bloquea el main thread
      const alice = createDiffieHellman(DH_KEY_SIZE);

      const alicePublicKey = alice.generateKeys();

      const prime = alice.getPrime();
      const generator = alice.getGenerator();

      outgoingUser!.outgoingRequests.push({
        user: incomingUser!._id,
      });

      const outgoingUserProm = outgoingUser!.save();

      incomingUser!.incomingRequests.push({
        peerPublicPart: alicePublicKey,
        p: prime,
        g: generator,
        user: outgoingUser!._id,
      });

      const incomingUserProm = incomingUser!.save();

      await Promise.all([outgoingUserProm, incomingUserProm]);

      return res
        .status(200)
        .json({ outgoingRequests: outgoingUser!.outgoingRequests });
    } catch (err) {
      return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
    }
  }
);

requestController.post(
  "/requests/accept",
  async (req: Request, res: Response) => {
    if (!validBody(req.body, REQUESTS.ACCEPT_KEYS)) {
      return res.status(400).json({ msg: INVALID_BODY });
    }
    const { valarSession } = req.signedCookies;
    const { username } = valarSession;

    try {
      const p1 = userService.findByUsernameIncoming(username);
      const p2 = userService.findByUsernameOutgoing(req.body.username);
      const [[, user], [, friend]] = await Promise.all([p1, p2]);

      const incomingRequest = user?.incomingRequests?.find(
        (request) => request.user.username === req.body.username
      );
      const outgoingRequestFriend = friend?.outgoingRequests?.find(
        (request) => request.user.username === username
      );

      // TODO: que corra en otro thread ya que ahorita bloquea el main thread
      const me = createDiffieHellman(
        incomingRequest!.p.toString("hex"),
        "hex",
        incomingRequest!.g.toString("hex"),
        "hex"
      );

      me.generateKeys();
      const secret = me.computeSecret(incomingRequest!.peerPublicPart);

      const chatObject = new Chat({
        idUser1: user?._id,
        idUser2: friend?._id,
        messages: [],
      });

      const chat = await chatObject.save();

      user!.chats!.push({
        chatId: chat._id,
        key: secret,
      });

      friend!.chats!.push({
        chatId: chat._id,
        key: secret,
      });

      user?.incomingRequests?.id(incomingRequest?._id).remove();
      friend?.outgoingRequests?.id(outgoingRequestFriend?._id).remove();

      const userPromise = user!.save();
      const friendPromise = friend!.save();

      await Promise.all([userPromise, friendPromise]);

      return res.status(200).json({ msg: CHAT.SUCCESS.CREATION });
    } catch (err) {
      return res.status(500).json({ msg: CHAT.ERROR.CREATION, err });
    }
  }
);

requestController.post(
  "/requests/decline",
  async (req: Request, res: Response) => {
    if (!validBody(req.body, REQUESTS.DECLINE_KEYS)) {
      return res.status(400).json({ msg: INVALID_BODY });
    }
    // TODO: borrar el request de incoming y de outgoing de los usuarios correspondientes
  }
);

export default requestController;
