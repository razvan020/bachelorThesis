package org.example.xlr8travel.controllers;

import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.services.BoardingPassPdfService;
import org.example.xlr8travel.services.TicketService;
import org.example.xlr8travel.services.UserService;
import org.example.xlr8travel.models.Ticket;
import org.example.xlr8travel.models.User;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/check-in")
@RequiredArgsConstructor
public class BoardingPassController {

    private static final Logger log = LoggerFactory.getLogger(BoardingPassController.class);
    private final TicketService ticketService;
    private final BoardingPassPdfService pdfService;
    private final UserService userService; // Added UserService injection

    /**
     * Get all boarding passes (checked-in tickets) for the authenticated user
     */
    @GetMapping("/boarding-passes")
    public ResponseEntity<List<Ticket>> getBoardingPasses(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            String username = userDetails.getUsername();
            Long userId = getUserIdFromUsername(username);

            if (userId == null) {
                log.warn("User not found for username: {}", username);
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }

            List<Ticket> checkedInTickets = ticketService.findCheckedInTickets(userId);
            return ResponseEntity.ok(checkedInTickets);
        } catch (Exception e) {
            log.error("Error fetching boarding passes for user: {}", userDetails.getUsername(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Download boarding pass as PDF
     */
    @GetMapping("/boarding-passes/{ticketId}/download")
    public ResponseEntity<byte[]> downloadBoardingPass(
            @PathVariable Long ticketId,
            @AuthenticationPrincipal UserDetails userDetails) {

        if (userDetails == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            // Get the ticket and verify it belongs to the user
            Ticket ticket = ticketService.findById(ticketId);
            if (ticket == null) {
                return ResponseEntity.notFound().build();
            }

            // Verify the ticket belongs to the authenticated user
            String username = userDetails.getUsername();
            if (!ticket.getUser().getUsername().equals(username)) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Generate PDF
            byte[] pdfBytes = pdfService.generateBoardingPassPdf(ticket);

            // Set headers for file download
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_PDF);
            headers.setContentDispositionFormData("attachment",
                    String.format("boarding-pass-%s-%s.pdf",
                            ticket.getFlight().getName(),
                            ticket.getId()));

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(pdfBytes);

        } catch (Exception e) {
            log.error("Error generating boarding pass PDF for ticket: {}", ticketId, e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * Get user ID from username using UserService
     */
    private Long getUserIdFromUsername(String username) {
        try {
            User user = userService.findByUsername(username);
            return user != null ? user.getId() : null;
        } catch (Exception e) {
            log.error("Error finding user by username: {}", username, e);
            return null;
        }
    }
}