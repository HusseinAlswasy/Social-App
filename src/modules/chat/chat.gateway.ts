import type { Server, Socket } from "socket.io";
import chatEvent from "../gateway/chat.event.js";

class ChatGateWay {
  constructor() {}
  async registerEvent(socket: Socket,io:Server) {
    chatEvent.hi(socket);
    chatEvent.sendMessage(socket,io);
  }
}

export default new ChatGateWay();
