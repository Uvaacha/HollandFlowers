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

import java.io.UnsupportedEncodingException;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.email.from:noreply@flowerskw.com}")
    private String fromEmail;

    @Value("${app.email.from-name:Holland Flowers}")
    private String fromName;

    @Value("${app.email.owner:owner@flowerskw.com}")
    private String ownerEmail;

    // =============== CORE EMAIL SENDING METHOD ===============

    @Async
    public void sendEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            log.info("✅ Email sent successfully to: {}", to);

        } catch (MessagingException | UnsupportedEncodingException e) {
            log.error("❌ Failed to send email to {}: {}", to, e.getMessage());
        }
    }

    // =============== CUSTOMER EMAILS ===============

    @Async
    public void sendOrderConfirmationEmail(String to, String orderNumber, String customerName) {
        String subject = "✅ Order Confirmed - " + orderNumber + " | Holland Flowers";
        String html = buildOrderConfirmationEmail(orderNumber, customerName);
        sendEmail(to, subject, html);
    }

    @Async
    public void sendOrderStatusUpdateEmail(String to, String orderNumber, String newStatus) {
        String statusEmoji = getStatusEmoji(newStatus);
        String formattedStatus = formatStatus(newStatus);
        String subject = statusEmoji + " Order Update: " + orderNumber + " - " + formattedStatus;
        String html = buildOrderStatusEmail(orderNumber, newStatus);
        sendEmail(to, subject, html);
    }

    @Async
    public void sendPaymentConfirmationEmail(String to, String orderNumber, String amount) {
        String subject = "✅ Payment Received - Order " + orderNumber + " | Holland Flowers";
        String html = buildPaymentConfirmationEmail(orderNumber, amount);
        sendEmail(to, subject, html);
    }

    @Async
    public void sendWelcomeEmail(String to, String userName) {
        String subject = "🌸 Welcome to Holland Flowers!";
        String html = buildWelcomeEmail(userName);
        sendEmail(to, subject, html);
    }

    // =============== OWNER NOTIFICATION - NEW ORDER ===============

    /**
     * Full version with all details including sender info (15 params)
     */
    @Async
    public void sendNewOrderNotificationToOwner(
            String orderNumber,
            String customerName,
            String customerEmail,
            String customerPhone,
            String senderName,
            String senderPhone,
            String recipientName,
            String recipientPhone,
            String deliveryAddress,
            String deliveryArea,
            String deliveryCity,
            String cardMessage,
            String deliveryInstructions,
            String itemsHtml,
            String totalAmount
    ) {
        String subject = "🔔 NEW ORDER: " + orderNumber + " - KD " + totalAmount;
        String html = buildNewOrderNotificationEmailFull(
                orderNumber, customerName, customerEmail, customerPhone,
                senderName, senderPhone, recipientName, recipientPhone,
                deliveryAddress, deliveryArea, deliveryCity,
                cardMessage, deliveryInstructions, itemsHtml, totalAmount
        );
        sendEmail(ownerEmail, subject, html);
        log.info("📧 New order notification sent to owner for order: {}", orderNumber);
    }

    /**
     * Original version for backward compatibility with HesabePaymentServiceImpl (14 params)
     */
    @Async
    public void sendNewOrderNotificationToOwner(
            String orderNumber,
            String customerName,
            String customerEmail,
            String customerPhone,
            String recipientName,
            String recipientPhone,
            String deliveryAddress,
            String deliveryArea,
            String preferredDeliveryDate,
            String cardMessage,
            String deliveryNotes,
            String orderItems,
            String totalAmount,
            String paymentMethod
    ) {
        String subject = "🔔 NEW ORDER: " + orderNumber + " - KD " + totalAmount;
        String html = buildNewOrderNotificationEmailOriginal(
                orderNumber, customerName, customerEmail, customerPhone,
                recipientName, recipientPhone, deliveryAddress, deliveryArea,
                preferredDeliveryDate, cardMessage, deliveryNotes, orderItems,
                totalAmount, paymentMethod
        );
        sendEmail(ownerEmail, subject, html);
        log.info("📧 New order notification sent to owner for order: {}", orderNumber);
    }

    /**
     * Simplified version - just order number, amount and customer name (3 params)
     */
    @Async
    public void sendNewOrderNotificationToOwner(String orderNumber, String totalAmount, String customerName) {
        String subject = "🔔 NEW ORDER: " + orderNumber + " - KD " + totalAmount;
        String html = buildSimpleNewOrderNotificationEmail(orderNumber, totalAmount, customerName);
        sendEmail(ownerEmail, subject, html);
        log.info("📧 New order notification sent to owner for order: {}", orderNumber);
    }

    // =============== EMAIL TEMPLATES ===============

    private String buildOrderConfirmationEmail(String orderNumber, String customerName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .header { background: linear-gradient(135deg, #e91e63 0%%, #ff5722 100%%); color: white; padding: 40px 30px; text-align: center; }
                    .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
                    .content { padding: 40px 30px; }
                    .order-box { background: linear-gradient(135deg, #fce4ec 0%%, #f8bbd9 100%%); padding: 25px; border-radius: 12px; text-align: center; margin: 25px 0; border: 2px dashed #e91e63; }
                    .order-number { font-size: 32px; color: #e91e63; font-weight: bold; letter-spacing: 2px; }
                    .footer { background: #f9f9f9; text-align: center; padding: 25px; color: #888; font-size: 13px; border-top: 1px solid #eee; }
                    .emoji { font-size: 48px; margin-bottom: 15px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <div class="emoji">🌸</div>
                        <h1>Thank You for Your Order!</h1>
                    </div>
                    <div class="content">
                        <p>Dear <strong>%s</strong>,</p>
                        <p>Your order has been confirmed and our florists are preparing your beautiful flowers with love and care.</p>
                        
                        <div class="order-box">
                            <p style="margin: 0 0 10px 0; color: #666; font-size: 14px;">ORDER NUMBER</p>
                            <p class="order-number">%s</p>
                        </div>
                        
                        <p>📦 <strong>What's next?</strong></p>
                        <ul>
                            <li>Our team is preparing your order</li>
                            <li>You'll receive an update when it's out for delivery</li>
                            <li>Track your order anytime on our website</li>
                        </ul>
                        
                        <p style="margin-top: 30px;">Thank you for choosing <strong>Holland Flowers</strong>! 🌷</p>
                    </div>
                    <div class="footer">
                        <p><strong>Holland Flowers Kuwait</strong></p>
                        <p>Questions? Reply to this email or contact us.</p>
                    </div>
                </div>
            </body>
            </html>
            """, customerName != null ? customerName : "Valued Customer", orderNumber);
    }

    private String buildOrderStatusEmail(String orderNumber, String status) {
        String statusEmoji = getStatusEmoji(status);
        String statusColor = getStatusColor(status);
        String statusMessage = getStatusMessage(status);
        String formattedStatus = formatStatus(status);

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background: #f5f5f5; }
                    .container { max-width: 600px; margin: 0 auto; background: white; }
                    .header { background: %s; color: white; padding: 35px 30px; text-align: center; }
                    .content { padding: 40px 30px; }
                    .status-box { background: #f9f9f9; padding: 30px; border-radius: 12px; text-align: center; margin: 25px 0; }
                    .status-emoji { font-size: 56px; margin-bottom: 15px; }
                    .status-text { font-size: 24px; font-weight: bold; color: %s; }
                    .message { background: #f0f9ff; padding: 20px; border-radius: 8px; border-left: 4px solid %s; margin: 20px 0; }
                    .footer { background: #f9f9f9; text-align: center; padding: 25px; color: #888; font-size: 13px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>%s Order Update</h1>
                        <p style="margin: 10px 0 0 0; opacity: 0.9;">Order #%s</p>
                    </div>
                    <div class="content">
                        <div class="status-box">
                            <div class="status-emoji">%s</div>
                            <div class="status-text">%s</div>
                        </div>
                        
                        <div class="message">
                            <p style="margin: 0;">%s</p>
                        </div>
                        
                        <p style="margin-top: 30px; text-align: center;">Thank you for choosing <strong>Holland Flowers</strong>! 🌷</p>
                    </div>
                    <div class="footer">
                        <p><strong>Holland Flowers Kuwait</strong></p>
                    </div>
                </div>
            </body>
            </html>
            """, statusColor, statusColor, statusColor,
                statusEmoji, orderNumber,
                statusEmoji, formattedStatus, statusMessage);
    }

    private String buildPaymentConfirmationEmail(String orderNumber, String amount) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background: linear-gradient(135deg, #4caf50, #8bc34a); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .amount-box { background: white; padding: 25px; border-radius: 10px; text-align: center; margin: 20px 0; }
                    .amount { font-size: 36px; font-weight: bold; color: #4caf50; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>✅ Payment Received!</h1>
                    </div>
                    <div class="content">
                        <p>Thank you! Your payment has been successfully processed.</p>
                        
                        <div class="amount-box">
                            <p style="margin: 0 0 10px 0; color: #666;">Order #%s</p>
                            <p class="amount">%s</p>
                        </div>
                        
                        <p>Your flowers are being prepared and will be on their way soon! 🌸</p>
                        
                        <p>Thank you for choosing <strong>Holland Flowers</strong>!</p>
                    </div>
                </div>
            </body>
            </html>
            """, orderNumber, amount);
    }

    private String buildWelcomeEmail(String userName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; }
                    .header { background: linear-gradient(135deg, #e91e63, #ff5722); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🌸 Welcome to Holland Flowers!</h1>
                        <p>Hello %s!</p>
                    </div>
                    <div class="content">
                        <p>Thank you for joining our flower-loving community!</p>
                        <p>Explore our beautiful collection of fresh flowers and arrangements from the finest sources.</p>
                        <p>We can't wait to help you spread joy with our beautiful blooms! 🌷</p>
                    </div>
                </div>
            </body>
            </html>
            """, userName != null ? userName : "Friend");
    }

    /**
     * Original email template (used by HesabePaymentServiceImpl)
     */
    private String buildNewOrderNotificationEmailOriginal(
            String orderNumber, String customerName, String customerEmail, String customerPhone,
            String recipientName, String recipientPhone, String deliveryAddress, String deliveryArea,
            String preferredDeliveryDate, String cardMessage, String deliveryNotes, String orderItems,
            String totalAmount, String paymentMethod
    ) {
        String cardMessageSection = (cardMessage != null && !cardMessage.isEmpty())
                ? "<div class=\"section\"><h3>💌 Card Message</h3><div class=\"card-message\">\"" + cardMessage + "\"</div></div>"
                : "";

        String deliveryNotesSection = (deliveryNotes != null && !deliveryNotes.isEmpty())
                ? "<div class=\"section\"><h3>📋 Delivery Notes</h3><p class=\"notes\">" + deliveryNotes + "</p></div>"
                : "";

        String deliveryDateSection = (preferredDeliveryDate != null && !preferredDeliveryDate.isEmpty())
                ? "<div class=\"delivery-date\">📅 Preferred Delivery: " + preferredDeliveryDate + "</div>"
                : "";

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 650px; margin: 0 auto; }
                    .header { background: #dc2626; color: white; padding: 25px; text-align: center; }
                    .header h1 { margin: 0; font-size: 22px; }
                    .header .order-num { font-size: 28px; font-weight: bold; margin-top: 10px; }
                    .content { background: #f9f9f9; padding: 25px; }
                    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                    .section h3 { margin: 0 0 15px 0; color: #dc2626; font-size: 15px; border-bottom: 2px solid #fee2e2; padding-bottom: 8px; }
                    .row { margin: 8px 0; }
                    .label { color: #666; font-size: 13px; display: inline-block; min-width: 100px; }
                    .value { font-weight: 500; color: #333; }
                    .card-message { background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); padding: 20px; border-radius: 8px; font-style: italic; color: #be185d; border-left: 4px solid #ec4899; text-align: center; }
                    .notes { background: #ecfdf5; padding: 15px; border-radius: 8px; color: #065f46; border-left: 4px solid #10b981; }
                    .delivery-date { background: #fef3c7; padding: 15px; border-radius: 8px; color: #92400e; border-left: 4px solid #f59e0b; margin: 15px 0; font-weight: 500; }
                    .total-box { background: #dc2626; color: white; padding: 25px; text-align: center; border-radius: 10px; margin-top: 20px; }
                    .total-amount { font-size: 36px; font-weight: bold; }
                    .payment-method { background: #dbeafe; color: #1e40af; padding: 10px 20px; border-radius: 20px; display: inline-block; margin-top: 10px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 NEW ORDER RECEIVED!</h1>
                        <div class="order-num">%s</div>
                    </div>
                    <div class="content">
                        
                        <div class="section">
                            <h3>👤 Customer Account</h3>
                            <div class="row"><span class="label">Name:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Email:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Phone:</span> <span class="value">%s</span></div>
                        </div>
                        
                        <div class="section">
                            <h3>🚚 Delivery Information</h3>
                            <div class="row"><span class="label">Recipient:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Phone:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Address:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Area:</span> <span class="value">%s</span></div>
                        </div>
                        
                        %s
                        
                        %s
                        
                        %s
                        
                        <div class="section">
                            <h3>🛒 Order Items</h3>
                            %s
                        </div>
                        
                        <div class="total-box">
                            <div style="font-size: 14px; opacity: 0.9;">TOTAL AMOUNT</div>
                            <div class="total-amount">KD %s</div>
                            <div class="payment-method">💳 %s</div>
                        </div>
                        
                    </div>
                </div>
            </body>
            </html>
            """,
                orderNumber,
                customerName != null ? customerName : "-",
                customerEmail != null ? customerEmail : "-",
                customerPhone != null ? customerPhone : "-",
                recipientName != null ? recipientName : "-",
                recipientPhone != null ? recipientPhone : "-",
                deliveryAddress != null ? deliveryAddress : "-",
                deliveryArea != null ? deliveryArea : "-",
                deliveryDateSection,
                cardMessageSection,
                deliveryNotesSection,
                orderItems != null ? orderItems : "-",
                totalAmount != null ? totalAmount : "0.000",
                paymentMethod != null ? paymentMethod : "Online"
        );
    }

    /**
     * Full email template with sender info (15 params version)
     */
    private String buildNewOrderNotificationEmailFull(
            String orderNumber, String customerName, String customerEmail, String customerPhone,
            String senderName, String senderPhone, String recipientName, String recipientPhone,
            String deliveryAddress, String deliveryArea, String deliveryCity,
            String cardMessage, String deliveryInstructions, String itemsHtml, String totalAmount
    ) {
        String cardMessageSection = (cardMessage != null && !cardMessage.isEmpty())
                ? "<div class=\"section\"><h3>💌 Card Message</h3><div class=\"card-message\">\"" + cardMessage + "\"</div></div>"
                : "";

        String instructionsSection = (deliveryInstructions != null && !deliveryInstructions.isEmpty())
                ? "<div class=\"section\"><h3>📋 Delivery Instructions</h3><p class=\"instructions\">" + deliveryInstructions + "</p></div>"
                : "";

        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
                    .container { max-width: 650px; margin: 0 auto; }
                    .header { background: #dc2626; color: white; padding: 25px; text-align: center; }
                    .header h1 { margin: 0; font-size: 22px; }
                    .header .order-num { font-size: 28px; font-weight: bold; margin-top: 10px; }
                    .content { background: #f9f9f9; padding: 25px; }
                    .section { background: white; padding: 20px; margin: 15px 0; border-radius: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                    .section h3 { margin: 0 0 15px 0; color: #dc2626; font-size: 15px; border-bottom: 2px solid #fee2e2; padding-bottom: 8px; }
                    .row { margin: 8px 0; }
                    .label { color: #666; font-size: 13px; display: inline-block; min-width: 100px; }
                    .value { font-weight: 500; color: #333; }
                    .card-message { background: linear-gradient(135deg, #fdf2f8 0%%, #fce7f3 100%%); padding: 20px; border-radius: 8px; font-style: italic; color: #be185d; border-left: 4px solid #ec4899; text-align: center; }
                    .instructions { background: #ecfdf5; padding: 15px; border-radius: 8px; color: #065f46; border-left: 4px solid #10b981; }
                    .total-box { background: #dc2626; color: white; padding: 25px; text-align: center; border-radius: 10px; margin-top: 20px; }
                    .total-amount { font-size: 36px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 NEW ORDER RECEIVED!</h1>
                        <div class="order-num">%s</div>
                    </div>
                    <div class="content">
                        
                        <div class="section">
                            <h3>👤 Customer Account</h3>
                            <div class="row"><span class="label">Name:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Email:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Phone:</span> <span class="value">%s</span></div>
                        </div>
                        
                        <div class="section">
                            <h3>🙋 Sender Information</h3>
                            <div class="row"><span class="label">Name:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Phone:</span> <span class="value">%s</span></div>
                        </div>
                        
                        <div class="section">
                            <h3>🚚 Delivery Information</h3>
                            <div class="row"><span class="label">Recipient:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Phone:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Address:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">Area:</span> <span class="value">%s</span></div>
                            <div class="row"><span class="label">City:</span> <span class="value">%s</span></div>
                        </div>
                        
                        %s
                        
                        %s
                        
                        <div class="section">
                            <h3>🛒 Order Items</h3>
                            %s
                        </div>
                        
                        <div class="total-box">
                            <div style="font-size: 14px; opacity: 0.9;">TOTAL AMOUNT</div>
                            <div class="total-amount">KD %s</div>
                        </div>
                        
                    </div>
                </div>
            </body>
            </html>
            """,
                orderNumber,
                customerName != null ? customerName : "-",
                customerEmail != null ? customerEmail : "-",
                customerPhone != null ? customerPhone : "-",
                senderName != null ? senderName : "-",
                senderPhone != null ? senderPhone : "-",
                recipientName != null ? recipientName : "-",
                recipientPhone != null ? recipientPhone : "-",
                deliveryAddress != null ? deliveryAddress : "-",
                deliveryArea != null ? deliveryArea : "-",
                deliveryCity != null ? deliveryCity : "-",
                cardMessageSection,
                instructionsSection,
                itemsHtml != null ? itemsHtml : "-",
                totalAmount != null ? totalAmount : "0.000"
        );
    }

    private String buildSimpleNewOrderNotificationEmail(String orderNumber, String totalAmount, String customerName) {
        return String.format("""
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 500px; margin: 0 auto; }
                    .header { background: #dc2626; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
                    .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
                    .total-box { background: #4caf50; color: white; padding: 20px; border-radius: 10px; text-align: center; margin-bottom: 20px; }
                    .total-amount { font-size: 36px; font-weight: bold; }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1>🔔 New Order!</h1>
                        <p style="margin: 5px 0; font-size: 18px;">%s</p>
                    </div>
                    <div class="content">
                        <div class="total-box">
                            <div>Order Total</div>
                            <div class="total-amount">KD %s</div>
                        </div>
                        <p><strong>Customer:</strong> %s</p>
                        <p style="text-align: center; margin-top: 20px;">
                            <em>View full details in the Admin Panel</em>
                        </p>
                    </div>
                </div>
            </body>
            </html>
            """, orderNumber, totalAmount, customerName != null ? customerName : "Guest");
    }

    // =============== HELPER METHODS ===============

    private String getStatusEmoji(String status) {
        if (status == null) return "📦";
        return switch (status.toUpperCase()) {
            case "CONFIRMED" -> "✅";
            case "PROCESSING" -> "🔄";
            case "OUT_FOR_DELIVERY" -> "🚚";
            case "DELIVERED" -> "🎉";
            case "CANCELLED" -> "❌";
            case "REFUNDED" -> "💰";
            default -> "📦";
        };
    }

    private String getStatusColor(String status) {
        if (status == null) return "#6b7280";
        return switch (status.toUpperCase()) {
            case "CONFIRMED" -> "#10b981";
            case "PROCESSING" -> "#f59e0b";
            case "OUT_FOR_DELIVERY" -> "#3b82f6";
            case "DELIVERED" -> "#22c55e";
            case "CANCELLED" -> "#ef4444";
            case "REFUNDED" -> "#8b5cf6";
            default -> "#6b7280";
        };
    }

    private String getStatusMessage(String status) {
        if (status == null) return "Your order status has been updated.";
        return switch (status.toUpperCase()) {
            case "CONFIRMED" -> "Great news! Your order has been confirmed. Our florists will start preparing your beautiful arrangement soon.";
            case "PROCESSING" -> "Your flowers are being carefully prepared by our expert florists!";
            case "OUT_FOR_DELIVERY" -> "Exciting! Your flowers are on their way to the delivery address. They should arrive soon!";
            case "DELIVERED" -> "Your flowers have been successfully delivered! We hope they bring joy and smiles. 💐";
            case "CANCELLED" -> "Your order has been cancelled. If you have any questions, please contact us.";
            case "REFUNDED" -> "Your refund has been processed. It may take 3-5 business days to reflect in your account.";
            default -> "Your order status has been updated.";
        };
    }

    private String formatStatus(String status) {
        if (status == null) return "Unknown";
        return switch (status.toUpperCase()) {
            case "OUT_FOR_DELIVERY" -> "Out for Delivery";
            case "PENDING" -> "Pending";
            case "CONFIRMED" -> "Confirmed";
            case "PROCESSING" -> "Processing";
            case "DELIVERED" -> "Delivered";
            case "CANCELLED" -> "Cancelled";
            case "REFUNDED" -> "Refunded";
            default -> status.substring(0, 1).toUpperCase() + status.substring(1).toLowerCase().replace("_", " ");
        };
    }
}