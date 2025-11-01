import { resendClient, sender } from "../utils/resend.js"
import { createWelcomeEmailTemplate } from "../emails/emailTemplate.js"
import { apiError } from "../utils/apiError.js";

export const sendWelcomeEmail = async (email, name, clientURL) => {
  const { data, error } = await resendClient.emails.send({
    from: `${sender.name} <${sender.email}>`,
    to: email,
    subject: "Welcome to Gupshup!",
    html: createWelcomeEmailTemplate(name, clientURL),
  });

  if (error) {
    console.error("Error sending welcome email:", error);
    throw new apiError(500,"Failed to send welcome email");
  }

  console.log("Welcome Email sent successfully", data);
};