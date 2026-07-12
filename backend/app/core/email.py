from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from app.core.config import settings

def get_mail_config() -> ConnectionConfig | None:
    if not all([settings.SMTP_HOST, settings.SMTP_USER, settings.SMTP_PASSWORD, settings.EMAILS_FROM_EMAIL]):
        return None
        
    return ConnectionConfig(
        MAIL_USERNAME=settings.SMTP_USER,
        MAIL_PASSWORD=settings.SMTP_PASSWORD,
        MAIL_FROM=settings.EMAILS_FROM_EMAIL,
        MAIL_PORT=settings.SMTP_PORT,
        MAIL_SERVER=settings.SMTP_HOST,
        MAIL_FROM_NAME=settings.EMAILS_FROM_NAME,
        MAIL_STARTTLS=settings.SMTP_TLS,
        MAIL_SSL_TLS=not settings.SMTP_TLS,
        USE_CREDENTIALS=True,
        VALIDATE_CERTS=True
    )

async def send_verification_email(email_to: str, otp_code: str):
    config = get_mail_config()
    if not config:
        print(f"\n[EMAIL BYPASS] SMTP is not configured. Logged OTP for {email_to}: {otp_code}\n")
        return

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

    message = MessageSchema(
        subject="TransitOps - Account Verification OTP",
        recipients=[email_to],
        body=html_content,
        subtype=MessageType.html
    )

    fm = FastMail(config)
    try:
        await fm.send_message(message)
        print(f"Verification email successfully sent to {email_to}")
    except Exception as e:
        print(f"Failed to send verification email to {email_to}: {e}")
