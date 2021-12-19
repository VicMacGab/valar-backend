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
    // logger.debug(`outgoing requests: ${JSON.stringify(user, null, 2)}`);
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
        req.body.username,
        "_id username incomingRequests"
      );

      if (!incomingFound) {
        logger.error("user receiving the request not found");
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

      const [_, outgoingUser] = await userService.findByUsername(
        username,
        "_id outgoingRequests"
      );
      logger.info(`found outgoing user`);

      outgoingUser!.outgoingRequests.push({
        user: incomingUser!._id,
      });
      logger.info(`pushed outgoing request`);

      const outgoingUserProm = outgoingUser!.save();
      logger.info(`saved outgoing user`);

      incomingUser!.incomingRequests.push({
        peerPublicPart: req.body.pubKey, // g^a mod p
        p: req.body.p,
        g: req.body.g,
        user: outgoingUser!._id,
      });
      logger.info(`pushed incoming request`);

      const incomingUserProm = incomingUser!.save();
      logger.info(`saved incoming user`);

      await Promise.all([outgoingUserProm, incomingUserProm]);
      logger.info(`saved both promises`);

      return res.status(200).json({ msg: USER.SUCCESS.SENT });
    } catch (err) {
      logger.error(
        `error when sending request: ${JSON.stringify(err, null, 2)}`
      );
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
      const [, user] = await userService.findByUsernameIncoming(username);

      // logger.debug(
      //   `this user is accepting request from ${
      //     req.body.username
      //   }: ${JSON.stringify(user, null, 2)}`
      // );

      // como no son muchas, esta que bien que sea O(n)
      const incomingRequest = user!.incomingRequests!.find(
        (request: any) => request.user.username === req.body.username
      );

      const responseJSON = {
        msg: USER.SUCCESS.REQUEST_ACCEPTED,
        peerPublicPart: incomingRequest.peerPublicPart, // g^a mod p
        p: incomingRequest.p,
        g: incomingRequest.g,
      };

      user!.incomingRequests!.id(incomingRequest!._id).remove();

      await user!.save();

      logger.info(`${username} accepted ${req.body.username}'s request`);

      return res.status(200).json(responseJSON);
    } catch (err) {
      logger.debug(`[accept request]: ${JSON.stringify(err, null, 2)}`);
      return res.status(500).json({ msg: CHAT.ERROR.CREATION, err });
    }
  }
);

requestController.put(
  "/requests/sendPubKey",
  async (req: Request, res: Response) => {
    if (!validBody(req.body, REQUESTS.SEND_PUB_PART_KEYS)) {
      return res.status(400).json({ msg: INVALID_BODY });
    }
    const { p, g, pubKey, friendUsername } = req.body;
    const {
      valarSession: { username },
    } = req.signedCookies;

    try {
      const p1 = userService.findByUsername(
        friendUsername,
        "_id chats outgoingRequests"
      );
      const p2 = userService.findByUsername(username, "_id chats");
      const [[, userReceivingPubKey], [, userSendingPubKey]] =
        await Promise.all([p1, p2]);

      const chatObject = new Chat({
        user1: userSendingPubKey?._id,
        user2: userReceivingPubKey?._id,
      });

      const chat = await chatObject.save();

      userSendingPubKey!.chats!.push({
        chat: chat._id,
        user: userReceivingPubKey!._id,
      });
      userReceivingPubKey!.chats!.push({
        chat: chat._id,
        user: userSendingPubKey!._id,
      });

      logger.debug(`created chat for both peers`);

      logger.debug(
        `userReceivingPubKey: ${JSON.stringify(userReceivingPubKey, null, 2)}`
      );
      logger.debug(
        `userSendingPubKey: ${JSON.stringify(userSendingPubKey, null, 2)}`
      );

      const outgoingRequest = userReceivingPubKey!.outgoingRequests.find(
        (oreq: any) => {
          logger.info(`oreq: ${JSON.stringify(oreq)}`);
          logger.info(
            `${oreq.user} === ${userSendingPubKey?._id}: ${
              oreq.user === userSendingPubKey?._id
            }`
          );
          return oreq.user.toString() === userSendingPubKey?._id.toString();
        }
      );

      //61b8dfacd039d7ef006348a8 === 61b8dfacd039d7ef006348a8

      logger.debug(
        `found outgoingRequest: ${JSON.stringify(outgoingRequest, null, 2)}`
      );

      const out = userReceivingPubKey!.outgoingRequests!.id(
        outgoingRequest!._id
      );
      out.accepted = true;
      out.peerPublicPart = Buffer.from(pubKey);
      out.p = Buffer.from(p);
      out.g = Buffer.from(g);

      await Promise.all([
        userSendingPubKey?.save(),
        userReceivingPubKey?.save(),
      ]);

      logger.debug(`saved both peers chats`);

      return res
        .status(200)
        .json({ msg: CHAT.SUCCESS.CREATION, chatId: chat._id });
    } catch (error) {
      logger.error(
        `/requests/sendPubket. ${username} and its pubKey: ${JSON.stringify(
          pubKey,
          null,
          2
        )}, error: ${JSON.stringify(error, null, 2)}`
      );
      return res.status(500).json({ msg: USER.ERROR.GENERIC });
    }
  }
);

requestController.put(
  "/requests/finish",
  async (req: Request, res: Response) => {
    if (!validBody(req.body, REQUESTS.FINISH_KEYS)) {
      return res.status(400).json({ msg: INVALID_BODY });
    }
    const {
      valarSession: { username },
    } = req.signedCookies;
    // TODO: optimizar
    try {
      const [, me] = await userService.findByUsername(
        username,
        "username outgoingRequests"
      );

      logger.debug(`user outgoingRequests: ${JSON.stringify(me, null, 2)}`);

      const outgoingRequest = me?.outgoingRequests.find((oreq) => {
        return oreq.user.toString() == req.body.friendId.toString();
      });

      logger.debug(
        `found outgoingRequest: ${JSON.stringify(outgoingRequest, null, 2)}`
      );

      me!.outgoingRequests!.id(outgoingRequest!._id).remove();

      const p3 = userService.findChatWithFriend(
        me!.username,
        req.body.friendId
      );

      const [user] = await Promise.all([p3, me?.save()]);

      logger.info(`deleted outgoing request because got accepted`);

      return res.status(200).json({ chatId: user?.chats[0].chat });
    } catch (error) {
      logger.error(
        `/requests/finish. username: ${username}, error: ${JSON.stringify(
          error,
          null,
          2
        )}`
      );
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
