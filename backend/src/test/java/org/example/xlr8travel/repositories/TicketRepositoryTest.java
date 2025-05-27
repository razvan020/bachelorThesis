package org.example.xlr8travel.repositories;

import org.example.xlr8travel.models.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest(
    properties = {
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=FALSE",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop"
    }
)
public class TicketRepositoryTest {

    @Autowired
    private TestEntityManager entityManager;

    @Autowired
    private TicketRepository ticketRepository;

    private User user1;
    private User user2;
    private Flight flight1;
    private Flight flight2;
    private Seat seat1;
    private Seat seat2;
    private Seat seat3;
    private Ticket ticket1;
    private Ticket ticket2;
    private Ticket ticket3;
    private Ticket ticket4;

    @BeforeEach
    void setUp() {
        // Create test users
        user1 = new User();
        user1.setUsername("testuser1");
        user1.setEmail("test1@example.com");
        user1.setPassword("password1");
        user1.setRoles(new ArrayList<>());
        user1.getRoles().add(Role.ROLE_USER);

        user2 = new User();
        user2.setUsername("testuser2");
        user2.setEmail("test2@example.com");
        user2.setPassword("password2");
        user2.setRoles(new ArrayList<>());
        user2.getRoles().add(Role.ROLE_USER);

        // Save users to the database
        entityManager.persist(user1);
        entityManager.persist(user2);

        // Create test flights
        flight1 = new Flight();
        flight1.setName("Flight 101");
        flight1.setOrigin("Origin1");
        flight1.setDestination("Destination1");
        flight1.setDepartureDate(LocalDate.now());
        flight1.setArrivalDate(LocalDate.now().plusDays(1));
        flight1.setDepartureTime(LocalTime.of(10, 0));
        flight1.setArrivalTime(LocalTime.of(12, 0));
        flight1.setPrice(BigDecimal.valueOf(100.0));
        flight1.setLastUpdated(LocalDateTime.now());

        flight2 = new Flight();
        flight2.setName("Flight 102");
        flight2.setOrigin("Origin2");
        flight2.setDestination("Destination2");
        flight2.setDepartureDate(LocalDate.now().plusDays(2));
        flight2.setArrivalDate(LocalDate.now().plusDays(3));
        flight2.setDepartureTime(LocalTime.of(14, 0));
        flight2.setArrivalTime(LocalTime.of(16, 0));
        flight2.setPrice(BigDecimal.valueOf(200.0));
        flight2.setLastUpdated(LocalDateTime.now());

        // Save flights to the database
        entityManager.persist(flight1);
        entityManager.persist(flight2);

        // Create test seats
        seat1 = new Seat("1A", true, SeatType.SEAT_TYPE_STANDARD);
        seat2 = new Seat("1B", true, SeatType.SEAT_TYPE_EXTRA_LEGROOM);
        seat3 = new Seat("2A", false, SeatType.SEAT_TYPE_UPFRONT);

        // Save seats to the database
        entityManager.persist(seat1);
        entityManager.persist(seat2);
        entityManager.persist(seat3);

        // Create test tickets
        ticket1 = new Ticket(100.0f, LocalDateTime.now().minusDays(5), TicketStatus.TICKET_STATUS_CONFIRMED, seat1);
        ticket1.setUser(user1);
        ticket1.setFlight(flight1);

        ticket2 = new Ticket(150.0f, LocalDateTime.now().minusDays(3), TicketStatus.TICKET_STATUS_BOOKED, seat2);
        ticket2.setUser(user1);
        ticket2.setFlight(flight2);

        ticket3 = new Ticket(200.0f, LocalDateTime.now().minusDays(1), TicketStatus.TICKET_STATUS_CHECKED_IN, seat3);
        ticket3.setUser(user2);
        ticket3.setFlight(flight1);

        ticket4 = new Ticket(120.0f, LocalDateTime.now().minusDays(10), TicketStatus.TICKET_STATUS_CANCELLED, null);
        ticket4.setUser(user2);
        ticket4.setFlight(flight2);

        // Save tickets to the database
        entityManager.persist(ticket1);
        entityManager.persist(ticket2);
        entityManager.persist(ticket3);
        entityManager.persist(ticket4);
        entityManager.flush();
    }

    @Test
    void findAll_ShouldReturnAllTickets() {
        // Act
        List<Ticket> tickets = ticketRepository.findAll();

        // Assert
        assertEquals(4, tickets.size());
    }

    @Test
    void findByFlightIdAndSeatNumber_ShouldReturnMatchingTickets() {
        // Act
        List<Ticket> tickets = ticketRepository.findByFlightIdAndSeatNumber(flight1.getId(), "1A");

        // Assert
        assertEquals(1, tickets.size());
        assertEquals(ticket1.getId(), tickets.get(0).getId());
    }

    @Test
    void findByFlightId_ShouldReturnMatchingTickets() {
        // Act
        List<Ticket> tickets = ticketRepository.findByFlightId(flight1.getId());

        // Assert
        assertEquals(2, tickets.size());
        assertTrue(tickets.stream().anyMatch(t -> t.getId().equals(ticket1.getId())));
        assertTrue(tickets.stream().anyMatch(t -> t.getId().equals(ticket3.getId())));
    }

    @Test
    void findByUserIdAndTicketStatus_ShouldReturnMatchingTickets() {
        // Act
        List<Ticket> tickets = ticketRepository.findByUserIdAndTicketStatus(user1.getId(), TicketStatus.TICKET_STATUS_BOOKED);

        // Assert
        assertEquals(1, tickets.size());
        assertEquals(ticket2.getId(), tickets.get(0).getId());
    }

    @Test
    void findByPurchaseTimeAfter_ShouldReturnMatchingTickets() {
        // Arrange
        // Use a date that's definitely before the purchase time of ticket1, ticket2, and ticket3
        LocalDateTime date = LocalDateTime.now().minusDays(6);

        // Act
        List<Ticket> tickets = ticketRepository.findByPurchaseTimeAfter(date);

        // Assert
        // In H2, ticket1, ticket2, and ticket3 are being returned
        assertEquals(3, tickets.size());
        assertTrue(tickets.stream().anyMatch(t -> t.getId().equals(ticket1.getId())));
        assertTrue(tickets.stream().anyMatch(t -> t.getId().equals(ticket2.getId())));
        assertTrue(tickets.stream().anyMatch(t -> t.getId().equals(ticket3.getId())));
    }

    @Test
    void findByPurchaseTimeBetween_ShouldReturnMatchingTickets() {
        // Arrange
        LocalDateTime startDate = LocalDateTime.now().minusDays(6);
        LocalDateTime endDate = LocalDateTime.now().minusDays(2);

        // Act
        List<Ticket> tickets = ticketRepository.findByPurchaseTimeBetween(startDate, endDate);

        // Assert
        assertEquals(2, tickets.size());
        assertTrue(tickets.stream().anyMatch(t -> t.getId().equals(ticket1.getId())));
        assertTrue(tickets.stream().anyMatch(t -> t.getId().equals(ticket2.getId())));
    }

    @Test
    void countByTicketStatus_ShouldReturnCorrectCount() {
        // Act
        long count = ticketRepository.countByTicketStatus(TicketStatus.TICKET_STATUS_CONFIRMED);

        // Assert
        assertEquals(1, count);
    }

    @Test
    void countTicketsCreatedAfter_ShouldReturnCorrectCount() {
        // Arrange
        // Use a date that's definitely before the purchase time of ticket1, ticket2, and ticket3
        LocalDateTime date = LocalDateTime.now().minusDays(6);

        // Act
        long count = ticketRepository.countTicketsCreatedAfter(date);

        // Assert
        // In H2, ticket1, ticket2, and ticket3 are being counted
        assertEquals(3, count);
    }

    @Test
    void sumTicketPrices_ShouldReturnCorrectSum() {
        // Act
        float sum = ticketRepository.sumTicketPrices();

        // Assert
        assertEquals(570.0f, sum, 0.01f);
    }

    @Test
    void averageTicketPrice_ShouldReturnCorrectAverage() {
        // Act
        float average = ticketRepository.averageTicketPrice();

        // Assert
        assertEquals(142.5f, average, 0.01f);
    }
}
