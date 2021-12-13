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

requestController.post(
  "/requests/send",
  async (req: Request, res: Response) => {
    if (!validBody(req.body, REQUESTS.SEND_KEYS)) {
      return res.status(400).json({ msg: INVALID_BODY });
    }
    const { valarSession } = req.signedCookies;
    const { username } = valarSession;

    try {
      const [incomingFound, incomingUser] = await userService.findByUsername(
        req.body.username
      );

      if (!incomingFound) {
        logger.error(
          "user sending the request or user receiving the request not found"
        );
        return res.status(404).json({ msg: USER.ERROR.NOT_FOUND });
      }

      const conflict = await userService.findRequestConflict(
        username,
        incomingUser?.username!,
        incomingUser?._id
      );

      if (conflict) {
        return res.status(400).json({ msg: USER.ERROR.REQUEST_CONFLICT });
      }

      const [_, outgoingUser] = await userService.findByUsername(username);

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

      return res.status(200).json({ msg: USER.SUCCESS.SENT });
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
      const p1 = userService.findByUsernameOutgoing(req.body.username);
      const p2 = userService.findByUsernameIncoming(username);
      const [[, friend], [, user]] = await Promise.all([p1, p2]);

      logger.debug(`friend: ${JSON.stringify(friend, null, 2)}`);
      logger.debug(`user: ${JSON.stringify(user, null, 2)}`);

      const incomingRequest = user?.incomingRequests?.find(
        (request: any) => request.user.username === req.body.username
      );
      const outgoingRequestFriend = friend?.outgoingRequests?.find(
        (request: any) => request.user.username === username
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
        user1: user?._id,
        user2: friend?._id,
      });

      const chat = await chatObject.save();

      user!.chats!.push({
        chat: chat._id,
        key: secret,
        user: friend?._id,
      });

      friend!.chats!.push({
        chat: chat._id,
        key: secret,
        user: user?._id,
      });

      user?.incomingRequests?.id(incomingRequest?._id).remove();
      friend?.outgoingRequests?.id(outgoingRequestFriend?._id).remove();

      const userPromise = user!.save();
      const friendPromise = friend!.save();

      await Promise.all([userPromise, friendPromise]);

      return res.status(200).json({ msg: CHAT.SUCCESS.CREATION });
    } catch (err) {
      logger.debug(`[accept request]: ${JSON.stringify(err, null, 2)}`);
      return res.status(500).json({ msg: CHAT.ERROR.CREATION, err });
    }
  }
);

//TODO refactor a services de las cosas repetidas
requestController.post(
  "/requests/decline",
  async (req: Request, res: Response) => {
    if (!validBody(req.body, REQUESTS.DECLINE_KEYS)) {
      return res.status(400).json({ msg: INVALID_BODY });
    }

    const { valarSession } = req.signedCookies;
    const { username } = valarSession;

    try {
      const p1 = userService.findByUsernameIncoming(username);
      const p2 = userService.findByUsernameOutgoing(req.body.username);
      const [[incomingFound, incomingUser], [outgoingFound, outgoingUser]] =
        await Promise.all([p1, p2]);

      if (!outgoingFound || !incomingFound) {
        logger.error(
          "user sending the request or user receiving the request not found"
        );
        return res.status(404).json({ msg: USER.ERROR.NOT_FOUND });
      }

      const incomingRequest = incomingUser?.incomingRequests?.find(
        (request: any) => request.user.username === req.body.username
      );

      const outgoingRequest = outgoingUser?.outgoingRequests?.find(
        (request: any) => request.user.username === username
      );

      incomingUser?.incomingRequests?.id(incomingRequest?._id).remove();
      outgoingUser?.outgoingRequests?.id(outgoingRequest?._id).remove();

      const incomingPromise = incomingUser!.save();
      const outgoingPromise = outgoingUser!.save();

      await Promise.all([incomingPromise, outgoingPromise]);

      return res.status(200).json({ msg: USER.SUCCESS.DECLINED });
    } catch (err) {
      logger.error(`${JSON.stringify(err, null, 2)}`);
      return res.status(500).json({ msg: USER.ERROR.GENERIC, err });
    }
  }
);

export default requestController;
