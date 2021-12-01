import express, { Request, Response, Router } from "express";
import ensureLoggedInMiddleware from "../middleware/ensureLoggedInMiddleware";

import userService from "../services/userService";

import { createDiffieHellman } from "crypto";
import { request } from "http";
import User from "../models/User";
import { CHAT, USER } from "../utils/constants/messages";
import logger from "../services/logger";
import Chat from "../models/Chat";

const requestController: Router = express.Router();

requestController.use("/requests", ensureLoggedInMiddleware);

requestController.get("/requests/sent", async (req: Request, res: Response) => {
  const { valarSession } = req.signedCookies;
  const { username } = JSON.parse(valarSession);
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
    const { username } = JSON.parse(valarSession);
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
    const { valarSession } = req.signedCookies;
    const { username } = JSON.parse(valarSession);
    //TODO promise all
    try {
      const p1 = userService.findByUsername(username);
      const p2 = userService.findByUsername(req.body.username);
      const [[outgoingFound, outgoingUser], [incomingFound, incomingUser]] =
        await Promise.all([p1, p2]);

      if (!outgoingFound || !incomingFound) {
        logger.error("requests send");
        return res.status(404).json({ msg: USER.ERROR.NOT_FOUND });
      }

      // TODO que corra en otro thread
      const alice = createDiffieHellman(2048);

      const alicePublicKey = alice.generateKeys();
      const alicePrivateKey = alice.getPrivateKey();

      const prime = alice.getPrime();
      const generator = alice.getGenerator();

      outgoingUser!.outgoingRequests.push({
        user: incomingUser!._id,
      });

      await outgoingUser!.save();

      incomingUser!.incomingRequests.push({
        peerPublicPart: alicePublicKey,
        p: prime,
        g: generator,
        user: outgoingUser!._id,
      });

      await incomingUser!.save();

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
    const { valarSession } = req.signedCookies;
    const { username } = JSON.parse(valarSession);
    try {
      const p1 = userService.findByUsernameIncoming(username);
      const p2 = userService.findByUsernameOutgoing(req.body.username);
      const [[, user], [, friend]] = await Promise.all([p1, p2]);

      const incomingRequest = user?.incomingRequests?.find(
        (request: any) => request.user.username === req.body.username
      );
      const outgoingRequestFriend = friend?.outgoingRequests?.find(
        (request: any) => request.user.username === username
      );

      //@ts-ignore
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

      //@ts-ignore
      user?.incomingRequests?.id(incomingRequest?._id).remove();
      //@ts-ignore
      friend?.outgoingRequests?.id(outgoingRequestFriend?._id).remove();

      //@ts-ignore
      const userPromise = user.save();
      //@ts-ignore
      const friendPromise = friend.save();
      await Promise.all([userPromise, friendPromise]);

      return res.status(200).json({ msg: CHAT.SUCCESS.CREATION });
    } catch (err) {
      return res.status(500).json({ msg: CHAT.ERROR.CREATION, err });
    }
  }
);

export default requestController;
