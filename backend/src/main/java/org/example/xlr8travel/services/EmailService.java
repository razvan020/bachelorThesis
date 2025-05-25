package org.example.xlr8travel.services;

import org.example.xlr8travel.models.Order;
import org.example.xlr8travel.models.User;

/**
 * Service interface for handling email operations.
 */
public interface EmailService {

    /**
     * Sends a purchase confirmation email with ticket details to the user.
     *
     * @param order The order containing purchase details
     * @param user The user who made the purchase
     * @param currencySymbol The currency symbol to use in the email (e.g., "$", "€", "£")
     * @return true if the email was sent successfully, false otherwise
     */
    boolean sendPurchaseConfirmationEmail(Order order, User user, String currencySymbol);

    /**
     * Sends a simple text email.
     *
     * @param to Recipient email address
     * @param subject Email subject
     * @param text Email body text
     * @return true if the email was sent successfully, false otherwise
     */
    boolean sendSimpleEmail(String to, String subject, String text);
}
