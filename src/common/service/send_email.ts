
import nodemailer from "nodemailer";
import "dotenv/config";
import { EMAIL_ADDRESS, EMAIL_PASSWORD } from "../../config/config.service";
import { SendMailOptions } from "nodemailer";

const sendEmail = async (data:SendMailOptions) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user:EMAIL_ADDRESS,
            pass: EMAIL_PASSWORD,
        },
    });

    try {
        const info = await transporter.sendMail({
            from: `"S7S_DEV" <${EMAIL_ADDRESS}>`,
            to:data.to,
            subject:data.subject || "",
            html:data.html || "",
            attachments:data.attachments || []
        });

        return info.accepted.length > 0 ? true : false; 

    } catch (err) {
        console.error("Error while sending mail:", err);
    }
}

export const otp = async () => {
    return Math.floor(Math.random() * 900000) + 100000;
}

export default sendEmail;