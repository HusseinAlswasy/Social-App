
import { Router } from "express";
import { NotificationService } from "../../service/notification.service";
import AppError from "../../common/middleware/globalErrorHandel.middleware";

const notificationRouter = Router();
const notificationService = new NotificationService();

notificationRouter.post("/send", async (req, res) => {
  const { token, title, body } = req.body;

  if (!token || !title || !body) {
    throw new AppError("token, title and body are required", 400);
  }

  const messageId = await notificationService.sendToDevice({
    token,
    title,
    body,
  });

  res.status(200).json({
    message: "Sent",
    messageId,
  });
});

export default notificationRouter;