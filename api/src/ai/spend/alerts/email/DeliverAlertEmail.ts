import {EmailMessage} from "cloudflare:email";
import {buildAlertEmail} from "@src/ai/spend/alerts/email/deliver-alert-email/BuildAlertEmail";
import type {AlertEmail} from "@src/ai/spend/types/AlertEmail";

/**
 * Sends one spend alert through Cloudflare's Email Routing `send_email` binding, as the personal site's contact Worker does. This is the
 * Workers runtime's edge, kept to wiring and not unit tested (`cloudflare:email` exists only inside the runtime): what the email says
 * is `buildAlertEmail`'s. Cloudflare delivers only to an address verified in Email Routing, so a failure here rejects and is retried.
 */
export async function deliverAlertEmail(mail: SendEmail, alert: AlertEmail): Promise<void> {
  await mail.send(new EmailMessage(alert.fromAddress, alert.toAddress, buildAlertEmail(alert)));
}
