import type { Server, Socket } from "socket.io";
import chatService from "../chat/chat.service.js";

class ChatEvent {
  constructor() {}

  hi = async (socket: Socket) => {
    socket.on("hi", (data) => {
      chatService.hi(data)
    });
  };

  sendMessage = (socket: Socket,io:Server) => {
    socket.on("sendMessage", async (data, ack?: (result: any) => void) => {
      try {
        const { recipientId, message } = await chatService.sendMessage(data, socket,io);

        socket.to(recipientId).emit("newMessage", {
          peerId: String(socket.data.user._id),
          message,
        });

        ack?.({ ok: true, message });
      } catch (error) {
        ack?.({
          ok: false,
          message: error instanceof Error ? error.message : "Failed to send message",
        });
      }
    });
  };
}

export default new ChatEvent();
