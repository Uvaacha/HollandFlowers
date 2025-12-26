package com.flowerapp.notification.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;


    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${spring.application.name:Flower App}")
    private String appName;

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, appName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("Email sent successfully to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        } catch (Exception e) {
            log.error("Unexpected error sending email to: {}", to, e);
            throw new RuntimeException("Failed to send email", e);
        }
    }

    @Async
    public void sendOrderConfirmationEmail(String to, String orderId, String orderDetails) {
        String subject = "Order Confirmation - " + orderId;
        String content = buildOrderConfirmationEmail(orderId, orderDetails);
        sendEmail(to, subject, content);
    }

    @Async
    public void sendOrderStatusUpdateEmail(String to, String orderId, String status) {
        String subject = "Order Status Update - " + orderId;
        String content = buildOrderStatusEmail(orderId, status);
        sendEmail(to, subject, content);
    }

    @Async
    public void sendPaymentConfirmationEmail(String to, String orderId, String amount) {
        String subject = "Payment Received - Order " + orderId;
        String content = buildPaymentConfirmationEmail(orderId, amount);
        sendEmail(to, subject, content);
    }

    @Async
    public void sendWelcomeEmail(String to, String userName) {
        String subject = "Welcome to Holland Flowers! 🌸";
        String content = buildWelcomeEmail(userName);
        sendEmail(to, subject, content);
    }

    private String buildOrderConfirmationEmail(String orderId, String orderDetails) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: #e91e63; color: white; padding: 20px; text-align: center; }
                    .content { padding: 20px; background: #f9f9f9; }
                    .order-id { font-size: 18px; font-weight: bold; color: #e91e63; }
                    .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌸 Order Confirmed!</h1>
                    </div>
                    <div class="content">
                        <p>Thank you for your order!</p>
                        <p class="order-id">Order ID: %s</p>
                        <p>%s</p>
                        <p>We'll notify you when your order is on its way.</p>
                    </div>
                    <div class="footer">
                        <p>©  2024 Holland Flowers. All rights reserved.</p>
                    </div>
                </div>
            </body>
            </html>
            """, orderId, orderDetails);
    }

    private String buildOrderStatusEmail(String orderId, String status) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .status-box { background: #e8f5e9; padding: 20px; border-radius: 8px; text-align: center; }
                    .status { font-size: 24px; font-weight: bold; color: #4caf50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>🌸 Order Update</h2>
                    <p>Your order <strong>%s</strong> has been updated:</p>
                    <div class="status-box">
                        <span class="status">%s</span>
                    </div>
                </div>
            </body>
            </html>
            """, orderId, status);
    }

    private String buildPaymentConfirmationEmail(String orderId, String amount) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .amount { font-size: 28px; font-weight: bold; color: #4caf50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>✅ Payment Received</h2>
                    <p>We've received your payment for order <strong>%s</strong></p>
                    <p class="amount">Amount: %s</p>
                    <p>Thank you for shopping with us!</p>
                </div>
            </body>
            </html>
            """, orderId, amount);
    }

    private String buildWelcomeEmail(String userName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .header { background: linear-gradient(135deg, #e91e63, #ff5722); 
                              color: white; padding: 40px; text-align: center; border-radius: 8px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌸 Welcome to Holland Flowers!</h1>
                        <p>Hello %s!</p>
                    </div>
                    <div style="padding: 20px;">
                        <p>Thank you for joining our flower-loving community!</p>
                        <p>Explore our beautiful collection of fresh flowers and arrangements.</p>
                    </div>
                </div>
            </body>
            </html>
            """, userName);
    }
}
