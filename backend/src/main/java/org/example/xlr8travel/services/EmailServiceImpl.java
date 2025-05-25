package org.example.xlr8travel.services;

import org.example.xlr8travel.models.Order;
import org.example.xlr8travel.models.OrderItem;
import org.example.xlr8travel.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import java.time.format.DateTimeFormatter;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");

    private final JavaMailSender emailSender;

    @Autowired
    public EmailServiceImpl(JavaMailSender emailSender) {
        this.emailSender = emailSender;
    }

    @Override
    public boolean sendPurchaseConfirmationEmail(Order order, User user, String currencySymbol) {
        // Default to EUR if no currency symbol is provided
        if (currencySymbol == null || currencySymbol.isEmpty()) {
            currencySymbol = "€";
        }
        try {
            MimeMessage message = emailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Use the email from the order's billing info if available, otherwise use the user's email
            String toEmail = (order.getBillingEmail() != null && !order.getBillingEmail().isEmpty()) 
                ? order.getBillingEmail() 
                : user.getEmail();

            helper.setTo(toEmail);
            helper.setSubject("XLR8 Travel - Your Purchase Confirmation #" + order.getId());

            // Build HTML content for the email
            StringBuilder htmlContent = new StringBuilder();
            htmlContent.append("<html><body>");
            htmlContent.append("<h1>Thank you for your purchase!</h1>");
            htmlContent.append("<p>Dear ").append(user.getFirstname()).append(" ").append(user.getLastname()).append(",</p>");
            htmlContent.append("<p>Your order has been confirmed. Here are your ticket details:</p>");

            htmlContent.append("<h2>Order Summary</h2>");
            htmlContent.append("<p><strong>Order ID:</strong> ").append(order.getId()).append("</p>");
            htmlContent.append("<p><strong>Order Date:</strong> ").append(order.getOrderDate().format(DATE_FORMATTER)).append("</p>");
            htmlContent.append("<p><strong>Total Amount:</strong> ").append(currencySymbol).append(order.getTotalPrice()).append("</p>");

            htmlContent.append("<h2>Flight Details</h2>");
            htmlContent.append("<table border='1' cellpadding='5' style='border-collapse: collapse;'>");
            htmlContent.append("<tr>");
            htmlContent.append("<th>Flight</th>");
            htmlContent.append("<th>Origin</th>");
            htmlContent.append("<th>Destination</th>");
            htmlContent.append("<th>Departure</th>");
            htmlContent.append("<th>Arrival</th>");
            htmlContent.append("<th>Quantity</th>");
            htmlContent.append("<th>Price</th>");
            htmlContent.append("</tr>");

            for (OrderItem item : order.getOrderItems()) {
                htmlContent.append("<tr>");
                htmlContent.append("<td>").append(item.getFlight().getName()).append("</td>");
                htmlContent.append("<td>").append(item.getFlight().getOrigin()).append("</td>");
                htmlContent.append("<td>").append(item.getFlight().getDestination()).append("</td>");
                htmlContent.append("<td>").append(item.getFlight().getDepartureDate()).append(" ").append(item.getFlight().getDepartureTime()).append("</td>");
                htmlContent.append("<td>").append(item.getFlight().getArrivalDate()).append(" ").append(item.getFlight().getArrivalTime()).append("</td>");
                htmlContent.append("<td>").append(item.getQuantity()).append("</td>");
                htmlContent.append("<td>").append(currencySymbol).append(item.getPricePerItem()).append("</td>");
                htmlContent.append("</tr>");
            }

            htmlContent.append("</table>");

            htmlContent.append("<p>Please keep this email as your ticket confirmation. You can present it at the airport check-in counter.</p>");
            htmlContent.append("<p>We hope you enjoy your journey with XLR8 Travel!</p>");
            htmlContent.append("<p>Best regards,<br/>The XLR8 Travel Team</p>");
            htmlContent.append("</body></html>");

            helper.setText(htmlContent.toString(), true);

            emailSender.send(message);
            log.info("Purchase confirmation email sent to {}", toEmail);
            return true;
        } catch (MessagingException e) {
            log.error("Failed to send purchase confirmation email", e);
            return false;
        }
    }

    @Override
    public boolean sendSimpleEmail(String to, String subject, String text) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);

            emailSender.send(message);
            log.info("Simple email sent to {}", to);
            return true;
        } catch (Exception e) {
            log.error("Failed to send simple email", e);
            return false;
        }
    }
}
