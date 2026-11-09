import { Server, Socket } from "socket.io";
import { Server as httpServer } from "http";
import { decode_and_fetchUser } from "../../common/middleware/authentication";
import RedisService from "../../service/redis.service";
import chatGateway from "../chat/chat.gateway.js";

class SocketGateWay {
  constructor() {}

  initIo = async (httpServer: httpServer) => {
    const io = new Server(httpServer, {
      cors: {
        origin: "*",
      },
    });

    io.use(async (socket, next) => {
      try {
        const authorization =
          socket.handshake.auth?.authorization ||
          socket.handshake.headers.authorization;
        const { user } = await decode_and_fetchUser(authorization as string);
        socket.data.user = user;

        next();
      } catch (error: any) {
        next(error instanceof Error ? error : new Error(String(error)));
      }
    });

    io.on("connection", async (socket: Socket) => {
      
      // Events
      chatGateway.registerEvent(socket, io);

      await socket.join(String(socket.data.user._id));

      socket.on("disconnect", async () => {
        try {
          await RedisService.removeSocket({
            userId: socket.data.user._id,
            SocketId: socket.id,
          });
          console.log("user disconnected");
        } catch (error) {
          console.error(
            "Failed to remove disconnected socket from Redis",
            error,
          );
        }
      });

      void (async () => {
        try {
          await RedisService.addSocket({
            userId: socket.data.user._id,
            SocketId: socket.id,
          });
          console.log(await RedisService.getSockets(socket.data.user._id));
        } catch (error) {
          console.error("Failed to register socket in Redis", error);
        }
      })();
    });
  };
}

export default new SocketGateWay();
