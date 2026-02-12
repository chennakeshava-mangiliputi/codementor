import nodemailer from 'nodemailer';

// Create email transporter (using Gmail)
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Send verification email to user
 */
export async function sendVerificationEmail(
  userEmail: string,
  fullName: string,
  verificationToken: string
) {
  try {
    // Create verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/verify?token=${verificationToken}`;

    // Create HTML email template
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 8px 8px; }
            .button { display: inline-block; background: #3b82f6; color: white !important; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
            .button:hover { background: #2563eb; }
            .footer { color: #999; font-size: 12px; text-align: center; margin-top: 20px; }
            .token-box { background: #f0f0f0; padding: 15px; border-radius: 6px; word-break: break-all; font-family: monospace; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🚀 Welcome to CODEMENTOR!</h1>
            </div>
            <div class="content">
              <p>Hi <strong>${fullName}</strong>,</p>
              
              <p>Thank you for registering with CODEMENTOR! To complete your registration and verify your email address, please click the button below:</p>
              
              <div style="text-align: center;">
                <a href="${verificationUrl}" class="button">✓ Verify My Account</a>
              </div>
              
              <p>Or copy and paste this link in your browser:</p>
              <div class="token-box">
                ${verificationUrl}
              </div>
              
              <p style="color: #666; font-size: 14px;">
                <strong>⏰ This link will expire in 24 hours.</strong><br>
                If you did not create this account, please ignore this email.
              </p>
            </div>
            
            <div class="footer">
              <p>CODEMENTOR - Transform Code into Interview Success<br>
              © 2026 CODEMENTOR. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Send email
    const result = await transporter.sendMail({
      from: `"CODEMENTOR" <${process.env.EMAIL_USER}>`,
      to: userEmail,
      subject: '✓ Verify Your CODEMENTOR Account',
      html: htmlContent,
    });

    console.log('Email sent successfully:', result.messageId);
    
    return {
      success: true,
      messageId: result.messageId,
    };
  } catch (error: any) {
    console.error('Email sending error:', error);
    return {
      success: false,
      error: error.message,
    };
  }
}