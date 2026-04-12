import nodemailer from "nodemailer";

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

interface StreakWarningEmailOptions {
  email: string;
  userName?: string;
  minimumTime: number;
  actualTime: number;
  remainingTime: number;
  deadline: string;
}

/**
 * Send streak warning email when user is at risk of losing streak
 */
export async function sendStreakWarningEmail(
  options: StreakWarningEmailOptions
) {
  const {
    email,
    userName = "Study Buddy",
    minimumTime,
    actualTime,
    remainingTime,
    deadline,
  } = options;

  const minutesText = (mins: number) =>
    mins === 60 ? "1 hour" : mins < 60 ? `${mins} minutes` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; }
          .content { background: #f9fafb; padding: 20px; margin-top: 20px; border-radius: 8px; }
          .warning { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .progress-bar { background: #e5e7eb; height: 8px; border-radius: 4px; overflow: hidden; margin: 10px 0; }
          .progress-fill { background: #667eea; height: 100%; width: VAR_PROGRESS%; transition: width 0.3s; }
          .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; border-radius: 6px; text-decoration: none; margin-top: 20px; }
          .footer { margin-top: 30px; font-size: 12px; color: #999; text-align: center; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔥 Your Focus Streak is at Risk!</h1>
          </div>

          <div class="content">
            <p>Hi ${userName},</p>

            <p>You're making great progress today, but you're about to miss your daily focus goal!</p>

            <div class="warning">
              <strong>⏰ Deadline: ${deadline}</strong><br>
              You need to focus for at least <strong>${minutesText(remainingTime)}</strong> more to protect your streak.
            </div>

            <h3>Today's Progress:</h3>
            <p>Focused: <strong>${minutesText(actualTime)}</strong> / Goal: ${minutesText(minimumTime)}</p>
            <div class="progress-bar">
              <div class="progress-fill" style="width: VAR_PROGRESS%;"></div>
            </div>
            <p style="text-align: center; color: #666;">VAR_PROGRESS%</p>

            <h3>What happens if you don't complete your goal?</h3>
            <ul>
              <li>Your current streak will be paused</li>
              <li>The remaining ${minutesText(remainingTime)} will carry over to tomorrow</li>
              <li>Tomorrow you'll need to focus for ${minutesText(minimumTime + remainingTime)} to reset your progress</li>
            </ul>

            <p><strong>You've got this! 💪</strong></p>

            <a href="http://localhost:3000/dashboard" class="button">Focus Now →</a>
          </div>

          <div class="footer">
            <p>FocusGrid • Your Personal Focus Companion</p>
            <p>Deadline: ${deadline} | Remaining: ${minutesText(remainingTime)}</p>
          </div>
        </div>
      </body>
    </html>
  `;

  // Calculate progress percentage
  const progressPercentage = Math.round((actualTime / minimumTime) * 100);
  const finalHtml = htmlContent
    .replace(/VAR_PROGRESS%/g, `${Math.min(100, progressPercentage)}`)
    .replace(/VAR_PROGRESS%|VAR_PROGRESS/g, `${Math.min(100, progressPercentage)}`);

  try {
    await transporter.sendMail({
      from: `"FocusGrid" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `⏰ Reminder: ${minutesText(remainingTime)} remaining to protect your streak!`,
      html: finalHtml,
      text: `
Hi ${userName},

Your focus streak is at risk! You need to focus for ${minutesText(remainingTime)} more before ${deadline}.

Today's Progress: ${minutesText(actualTime)} / Goal: ${minutesText(minimumTime)}

If you don't complete your goal:
- Your streak will be paused
- The remaining ${minutesText(remainingTime)} will carry over to tomorrow
- Tomorrow you'll need to focus for ${minutesText(minimumTime + remainingTime)} total

Let's go! 🚀
      `.trim(),
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending email:", error);
    throw error;
  }
}

/**
 * Send carry-over notification email
 */
export async function sendCarryOverNotification(
  email: string,
  options: {
    userName?: string;
    previousRemaining: number;
    newTarget: number;
    minimumDaily: number;
  }
) {
  const {
    userName = "Study Buddy",
    previousRemaining,
    newTarget,
    minimumDaily,
  } = options;

  const minutesText = (mins: number) =>
    mins === 60 ? "1 hour" : mins < 60 ? `${mins} minutes` : `${Math.floor(mins / 60)}h ${mins % 60}m`;

  try {
    await transporter.sendMail({
      from: `"FocusGrid" <${process.env.SMTP_USER}>`,
      to: email,
      subject: `📌 Carry-over reminder: ${minutesText(previousRemaining)} from yesterday`,
      html: `
        <p>Hi ${userName},</p>
        <p>Yesterday you didn't complete your daily goal, so we're carrying over ${minutesText(previousRemaining)} to today.</p>
        <p><strong>Today's new target: ${minutesText(newTarget)}</strong> (${minutesText(minimumDaily)} base + ${minutesText(previousRemaining)} carry-over)</p>
        <p>You've got this! Let's catch up today! 🚀</p>
      `,
    });

    return { success: true };
  } catch (error) {
    console.error("Error sending carry-over email:", error);
    throw error;
  }
}

/**
 * Test email configuration
 */
export async function testEmailConfiguration(testEmail: string) {
  try {
    await transporter.sendMail({
      from: `"FocusGrid" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: "FocusGrid Email Configuration Test",
      html: "<p>If you received this email, your email configuration is working correctly! ✅</p>",
      text: "Email configuration test successful!",
    });

    return { success: true, message: "Test email sent successfully" };
  } catch (error) {
    console.error("Error sending test email:", error);
    throw error;
  }
}
