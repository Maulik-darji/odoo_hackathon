import smtplib
import socket
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings


async def send_verification_email(email_to: str, otp_code: str):
    """Send OTP verification email using Python's built-in smtplib."""
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD, settings.EMAILS_FROM_EMAIL]):
        print(f"\n[EMAIL BYPASS] SMTP is not configured. Logged OTP for {email_to}: {otp_code}\n")
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = f"TransitOps - {otp_code} is your Verification Code"
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #0f172a;">Verify Your Account</h2>
        <p>Thank you for signing up for TransitOps. Use the verification code below to complete your registration:</p>
        <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px; font-size: 24px; font-weight: bold; letter-spacing: 4px; text-align: center; margin: 20px 0; color: #3b82f6;">
          {otp_code}
        </div>
        <p style="font-size: 12px; color: #64748b;">This code will expire in 10 minutes. If you did not request this, please ignore this email.</p>
      </body>
    </html>
    """

    message.attach(MIMEText(html_content, "html"))

    try:
        # Set a default socket timeout for all smtplib operations to prevent hanging on network drops
        socket.setdefaulttimeout(10)
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT, timeout=10)
        server.ehlo()
        if settings.SMTP_TLS:
            server.starttls()
            server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, message.as_string())
        server.quit()
        print(f"Verification email successfully sent to {email_to}")
    except Exception as e:
        print(f"Failed to send verification email to {email_to}: {e}")


async def send_approval_email(email_to: str, user_name: str, role: str):
    """Send approval confirmation email."""
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD, settings.EMAILS_FROM_EMAIL]):
        print(f"\n[EMAIL BYPASS] SMTP not configured. Skipping approval email for {email_to}\n")
        return

    message = MIMEMultipart("alternative")
    message["Subject"] = "TransitOps - Your Account Has Been Approved!"
    message["From"] = f"{settings.EMAILS_FROM_NAME} <{settings.EMAILS_FROM_EMAIL}>"
    message["To"] = email_to

    html_content = f"""
    <html>
      <body style="font-family: Arial, sans-serif; padding: 20px; color: #1e293b;">
        <h2 style="color: #0f172a;">Account Approved!</h2>
        <p>Hi {user_name or 'User'},</p>
        <p>Your operational access as <strong>{role}</strong> has been approved by the Administrator.</p>
        <p>You can now log in to the TransitOps dashboard and begin using the platform.</p>
        <br />
        <p style="font-size: 12px; color: #64748b;">Best regards,<br/>TransitOps Team</p>
      </body>
    </html>
    """

    message.attach(MIMEText(html_content, "html"))

    try:
        server = smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT)
        server.ehlo()
        if settings.SMTP_TLS:
            server.starttls()
            server.ehlo()
        server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
        server.sendmail(settings.EMAILS_FROM_EMAIL, email_to, message.as_string())
        server.quit()
        print(f"Approval email successfully sent to {email_to}")
    except Exception as e:
        print(f"Failed to send approval email to {email_to}: {e}")
