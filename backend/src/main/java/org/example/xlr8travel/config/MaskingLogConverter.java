package org.example.xlr8travel.config;

import ch.qos.logback.classic.pattern.MessageConverter;
import ch.qos.logback.classic.spi.ILoggingEvent;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Converter for masking sensitive data in logs
 */
public class MaskingLogConverter extends MessageConverter {

    private static final Pattern CREDIT_CARD_PATTERN = Pattern.compile("\\b(?:\\d[ -]*?){13,16}\\b");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("(?i)(password|passwd|pwd)\\s*[:=]\\s*[^\\s,;]+");
    private static final Pattern SSN_PATTERN = Pattern.compile("\\b\\d{3}-\\d{2}-\\d{4}\\b");
    private static final Pattern API_KEY_PATTERN = Pattern.compile("(?i)(api[_-]?key|secret[_-]?key|access[_-]?token)\\s*[:=]\\s*[^\\s,;]+");
    
    @Override
    public String convert(ILoggingEvent event) {
        String message = super.convert(event);
        if (message == null || message.isEmpty()) {
            return message;
        }
        
        // Mask credit card numbers
        message = maskWithPattern(message, CREDIT_CARD_PATTERN, "XXXX-XXXX-XXXX-XXXX");
        
        // Mask emails
        message = maskWithPattern(message, EMAIL_PATTERN, "****@****.***");
        
        // Mask passwords
        message = maskWithPattern(message, PASSWORD_PATTERN, "$1: ********");
        
        // Mask SSNs
        message = maskWithPattern(message, SSN_PATTERN, "XXX-XX-XXXX");
        
        // Mask API keys
        message = maskWithPattern(message, API_KEY_PATTERN, "$1: ********");
        
        return message;
    }
    
    /**
     * Masks text matching a pattern with a replacement
     * 
     * @param input The input text
     * @param pattern The pattern to match
     * @param replacement The replacement text
     * @return The masked text
     */
    private String maskWithPattern(String input, Pattern pattern, String replacement) {
        Matcher matcher = pattern.matcher(input);
        StringBuffer sb = new StringBuffer();
        
        while (matcher.find()) {
            matcher.appendReplacement(sb, replacement);
        }
        matcher.appendTail(sb);
        
        return sb.toString();
    }
}