import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import List, Optional
from src.config import settings

class EmailService:
    
    @staticmethod
    def send_email(
        to_emails: List[str],
        subject: str,
        body: str,
        html_body: Optional[str] = None
    ) -> bool:
        """Send email to recipients"""
        try:
            if not settings.SMTP_HOST:
                print(f"Email would be sent to {to_emails}: {subject}")
                return True  # Mock success for development
            
            msg = MIMEMultipart('alternative')
            msg['Subject'] = subject
            msg['From'] = settings.EMAIL_FROM
            msg['To'] = ', '.join(to_emails)
            
            # Add text part
            text_part = MIMEText(body, 'plain')
            msg.attach(text_part)
            
            # Add HTML part if provided
            if html_body:
                html_part = MIMEText(html_body, 'html')
                msg.attach(html_part)
            
            # Send email
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                if settings.SMTP_USERNAME and settings.SMTP_PASSWORD:
                    server.login(settings.SMTP_USERNAME, settings.SMTP_PASSWORD)
                server.send_message(msg)
            
            return True
            
        except Exception as e:
            print(f"Failed to send email: {e}")
            return False
    
    @staticmethod
    def send_password_reset_email(email: str, reset_token: str) -> bool:
        """Send password reset email"""
        reset_url = f"http://localhost:3000/reset-password?token={reset_token}"
        
        subject = "Password Reset - Smart Verify"
        body = f"""
        Hello,
        
        You have requested to reset your password for Smart Verify.
        
        Please click the link below to reset your password:
        {reset_url}
        
        This link will expire in {settings.PASSWORD_RESET_EXPIRE_HOURS} hours.
        
        If you did not request this password reset, please ignore this email.
        
        Best regards,
        Smart Verify Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Password Reset - Smart Verify</h2>
            <p>Hello,</p>
            <p>You have requested to reset your password for Smart Verify.</p>
            <p>Please click the button below to reset your password:</p>
            <a href="{reset_url}" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
               Reset Password
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p><a href="{reset_url}">{reset_url}</a></p>
            <p>This link will expire in {settings.PASSWORD_RESET_EXPIRE_HOURS} hours.</p>
            <p>If you did not request this password reset, please ignore this email.</p>
            <br>
            <p>Best regards,<br>Smart Verify Team</p>
        </body>
        </html>
        """
        
        return EmailService.send_email([email], subject, body, html_body)
    
    @staticmethod
    def send_welcome_email(email: str, username: str, user_type: str = "user") -> bool:
        """Send welcome email to new users"""
        subject = f"Welcome to Smart Verify - {user_type.title()} Account Created"
        
        body = f"""
        Hello {username},
        
        Welcome to Smart Verify! Your {user_type} account has been successfully created.
        
        You can now start {"selling your products" if user_type == "seller" else "shopping for amazing products"} on our platform.
        
        If you have any questions, please don't hesitate to contact our support team.
        
        Best regards,
        Smart Verify Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Welcome to Smart Verify!</h2>
            <p>Hello {username},</p>
            <p>Welcome to Smart Verify! Your {user_type} account has been successfully created.</p>
            <p>You can now start {"selling your products" if user_type == "seller" else "shopping for amazing products"} on our platform.</p>
            <p>If you have any questions, please don't hesitate to contact our support team.</p>
            <br>
            <p>Best regards,<br>Smart Verify Team</p>
        </body>
        </html>
        """
        
        return EmailService.send_email([email], subject, body, html_body)
