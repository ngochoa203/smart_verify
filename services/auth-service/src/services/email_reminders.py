from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from src.services.email_service import EmailService
from src.models import User, Seller

class EmailReminderService:
    
    @staticmethod
    def send_inactive_user_reminders(db: Session) -> int:
        """Send reminder emails to inactive users"""
        # Find users who haven't logged in for 30 days
        cutoff_date = datetime.utcnow() - timedelta(days=30)
        
        inactive_users = db.query(User).filter(
            User.is_active == True,
            User.created_at < cutoff_date
        ).all()
        
        count = 0
        for user in inactive_users:
            success = EmailReminderService._send_inactive_reminder(user.email, user.username)
            if success:
                count += 1
        
        return count
    
    @staticmethod
    def send_seller_verification_reminders(db: Session) -> int:
        """Send reminder emails to unverified sellers"""
        # Find sellers who haven't been verified for 7 days
        cutoff_date = datetime.utcnow() - timedelta(days=7)
        
        unverified_sellers = db.query(Seller).filter(
            Seller.is_verified == False,
            Seller.created_at < cutoff_date
        ).all()
        
        count = 0
        for seller in unverified_sellers:
            success = EmailReminderService._send_verification_reminder(
                seller.email, 
                seller.username,
                seller.shop_name
            )
            if success:
                count += 1
        
        return count
    
    @staticmethod
    def _send_inactive_reminder(email: str, username: str) -> bool:
        """Send reminder to inactive user"""
        subject = "We miss you at Smart Verify!"
        
        body = f"""
        Hello {username},
        
        We noticed you haven't been active on Smart Verify lately.
        
        We have exciting new products and features waiting for you!
        
        Log in now to discover:
        - New product arrivals
        - Special discounts
        - Improved shopping experience
        
        Come back and explore: http://localhost:3000/login
        
        Best regards,
        Smart Verify Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>We miss you at Smart Verify!</h2>
            <p>Hello {username},</p>
            <p>We noticed you haven't been active on Smart Verify lately.</p>
            <p>We have exciting new products and features waiting for you!</p>
            <h3>Log in now to discover:</h3>
            <ul>
                <li>New product arrivals</li>
                <li>Special discounts</li>
                <li>Improved shopping experience</li>
            </ul>
            <a href="http://localhost:3000/login" 
               style="background-color: #4CAF50; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
               Come Back Now
            </a>
            <br><br>
            <p>Best regards,<br>Smart Verify Team</p>
        </body>
        </html>
        """
        
        return EmailService.send_email([email], subject, body, html_body)
    
    @staticmethod
    def _send_verification_reminder(email: str, username: str, shop_name: str) -> bool:
        """Send verification reminder to seller"""
        subject = "Complete your seller verification - Smart Verify"
        
        body = f"""
        Hello {username},
        
        Your seller account for "{shop_name}" is still pending verification.
        
        To start selling on Smart Verify, please complete your verification by:
        1. Uploading required documents
        2. Providing business information
        3. Waiting for admin approval
        
        Complete verification: http://localhost:3000/seller/verify
        
        Our support team is here to help if you have any questions.
        
        Best regards,
        Smart Verify Team
        """
        
        html_body = f"""
        <html>
        <body>
            <h2>Complete your seller verification</h2>
            <p>Hello {username},</p>
            <p>Your seller account for "<strong>{shop_name}</strong>" is still pending verification.</p>
            <p>To start selling on Smart Verify, please complete your verification by:</p>
            <ol>
                <li>Uploading required documents</li>
                <li>Providing business information</li>
                <li>Waiting for admin approval</li>
            </ol>
            <a href="http://localhost:3000/seller/verify" 
               style="background-color: #FF9800; color: white; padding: 10px 20px; 
                      text-decoration: none; border-radius: 5px; display: inline-block;">
               Complete Verification
            </a>
            <p>Our support team is here to help if you have any questions.</p>
            <br>
            <p>Best regards,<br>Smart Verify Team</p>
        </body>
        </html>
        """
        
        return EmailService.send_email([email], subject, body, html_body)
