package org.example.xlr8travel.bootloader;

import lombok.extern.slf4j.Slf4j;
import org.example.xlr8travel.models.*;
import org.example.xlr8travel.repositories.FlightRepository;
import org.example.xlr8travel.services.AirlineService;
import org.example.xlr8travel.services.FlightService;
import org.example.xlr8travel.services.TicketService;
import org.example.xlr8travel.services.UserService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Date;
import java.util.HashSet;


@Component
@Slf4j
public class DataLoader implements CommandLineRunner {

    private final TicketService ticketService;
    private final UserService userService;
    private final AirlineService airlineService;

    private final FlightService flightService;
    private final FlightRepository flightRepository;

    public DataLoader(TicketService ticketService, UserService userService, AirlineService airlineService, FlightService flightService, FlightRepository flightRepository) {
        this.ticketService = ticketService;
        this.userService = userService;
        this.airlineService = airlineService;
        this.flightService = flightService;
        this.flightRepository = flightRepository;
    }

    @Override
    public void run(String... args) throws Exception {

        Country country1 = new Country("Romania");
        Country country2 = new Country("Germany");
        Country country3 = new Country("Italy");

        City city1 = new City("Bucharest");
        City city2 = new City("Cluj");
        City city3 = new City("Munich");
        City city4 = new City("Berlin");
        City city5 = new City("Rome");
        City city6 = new City("Milan");
        //City city7 = new City("Chisinau"); add a city without a country ...


        country1.addCity(city1);
        country1.addCity(city2);
        country2.addCity(city3);
        country2.addCity(city4);
        country3.addCity(city5);
        country3.addCity(city6);


        Airport airport1 = new Airport( "Henri Coanda", "OTP", city1);
        Airport airport2 = new Airport( "Avram Iancu", "CLJ", city2);
        Airport airport3 = new Airport( "Franz Josef Strauss", "MUC", city3);
        Airport airport4 = new Airport( "Berlin Brandenburg", "BER", city4);
        Airport airport5 = new Airport( "Leonardo da Vinci Fiumicino", "FCO", city5);
        Airport airport6 = new Airport( "Milano Malpensa", "MXP", city6);

        Route route1 =  new Route(1269, LocalTime.of(3,30));
          route1.setSourceAirport(airport1);
          route1.setDestinationAirport(airport4);


        Route route2 =  new Route(310, LocalTime.of(2,0));
          route2.setSourceAirport(airport1);
          route2.setDestinationAirport(airport2);


        Route route3 =  new Route(369, LocalTime.of(2, 30));
          route3.setSourceAirport(airport3);
          route3.setDestinationAirport(airport6);


        Route route4 =  new Route(200, LocalTime.of(1,15));
          route4.setSourceAirport(airport5);
          route4.setDestinationAirport(airport4);


        Aircraft aircraft1 = new Aircraft("Boeing 747", "Boeing", "Passenger", 416, 5240,
                "WiFi, Food, Entertainment", "987,000 kg", 66160,
                14200, 8800);

        Aircraft aircraft2 = new Aircraft("Cessna 172", "Cessna", "Private", 4, 120,
                "Basic amenities", "1,202 kg", 56,
                1710, 1062);


        //single Airline
        Airline airline = new Airline("xlr8Travel", "XT");
//test commit
        airline.addAircraft(aircraft1);
        airline.addAircraft(aircraft2);
        airline.addRoute(route1);
        airline.addRoute(route2);
        airline.addRoute(route3);
        airline.addRoute(route4);

        airlineService.save(airline);

        // List<Airline> airlines = airlineService.findAll();
        // airlines.forEach(System.out::println); // to modify @ToString(exclude = {})
// --------------------------------------------------------------

       // Flight flight1 = new Flight("xlr8Travel", LocalTime.of(3,30), LocalTime.of(6,30), "A", "1", LocalDateTime.now());
        // Base date for flights
        LocalDate baseDate = LocalDate.of(2025, 5, 17);

        // Create dates for round trips (different departure and return dates)
        LocalDate returnDate1 = baseDate.plusDays(3); // Return date 3 days later
        LocalDate returnDate2 = baseDate.plusDays(7); // Return date 7 days later

        // LAX to LHR flight (outbound)
        Flight flight1 = new Flight(null, "Flight 101", LocalTime.of(8, 30), LocalTime.of(14, 30),
                "LAX", "LHR", baseDate, baseDate, "A", "1", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(150.0));

        // LHR to LAX flight (return) - 3 days later
        Flight flight5 = new Flight(null, "Flight 102", LocalTime.of(10, 30), LocalTime.of(16, 30),
                "LHR", "LAX", returnDate1, returnDate1, "D", "10", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(250.0));

        // LHR to LAX flight (return) - 7 days later
        Flight flight6 = new Flight(null, "Flight 103", LocalTime.of(15, 45), LocalTime.of(21, 45),
                "LHR", "LAX", returnDate2, returnDate2, "B", "12", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(220.0));

        // Romania to Italy flight
        Flight flight2 = new Flight(null, "Flight 202", LocalTime.of(9, 15), LocalTime.of(11, 30),
                "Romania", "Italy", baseDate, baseDate, "A", "1", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(200.0));

        // Italy to Romania flight (return) - 3 days later
        Flight flight7 = new Flight(null, "Flight 203", LocalTime.of(12, 45), LocalTime.of(15, 00),
                "Italy", "Romania", returnDate1, returnDate1, "C", "5", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(190.0));

        // Another LAX to LHR flight (different time)
        Flight flightdep = new Flight(null, "Flight 104", LocalTime.of(14, 30), LocalTime.of(20, 30),
                "LAX", "LHR", baseDate, baseDate,
                "A", "1", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(200.0));

        // Germany to Italy flight
        Flight flight3 = new Flight(null, "Flight 300", LocalTime.of(7, 30), LocalTime.of(9, 30),
                "Germany", "Italy", baseDate, baseDate, "R", "10", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(200.0));

        // Another Germany to Italy flight (different time)
        Flight flight4 = new Flight(null, "Flight 301", LocalTime.of(16, 30), LocalTime.of(18, 30),
                "Germany", "Italy", baseDate, baseDate, "D", "10", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(250.0));
        // Add all flights to the airline
        airline.addFlight(flight1);
        airline.addFlight(flight2);
        airline.addFlight(flight3);
        airline.addFlight(flight4);
        airline.addFlight(flight5);
        airline.addFlight(flight6);
        airline.addFlight(flight7);
        airline.addFlight(flightdep);

        // Save all flights to the database
        flightService.save(flight1);
        flightService.save(flight2);
        flightService.save(flight3);
        flightService.save(flight4);
        flightService.save(flight5);
        flightService.save(flight6);
        flightService.save(flight7);
        flightService.save(flightdep);
        System.out.println(flight1.getArrivalDate().toString());
        System.out.println(flight1.getDepartureDate().toString());
        System.out.println(flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate("Romania","Germany",flight1.getArrivalDate(),flight1.getDepartureDate()));

  //     --------------------------------------------------------------

        Address address1 = new Address("Str. Dorobanti");
        Address address2 = new Address("Str. Hochenheimer");

       city1.addAddress(address1); // work with DTO!!!!
        city3.addAddress(address2); // can't save address without saving the person


        PasswordEncoder bcrypt = new BCryptPasswordEncoder();
        User user1 = new User("test", "test", "user1", 34, "M","u@g.com",bcrypt.encode("user1"), LocalDate.of(2000,03,15), Account_Status.ACCOUNT_STATUS_ACTIVE );
        user1.getRoles().add(Role.ROLE_USER);

        user1.addAddress(address1);


        User user2=new User("user2",bcrypt.encode("user2"),"a@y.com");
        user2.getRoles().add(Role.ROLE_ADMIN);

        User monitor=new User("monitor",bcrypt.encode("monpass"),"monitor");
        monitor.getRoles().add(Role.ROLE_ACTUATOR);

        userService.save(user1);
        userService.save(user2);
        userService.save(monitor);

        //----------------------------------------------------------------------

        FlightClass flightClass1 = new FlightClass(230, FlightClassType.FLIGHT_CLASS_TYPE_ECONOMY);
        FlightClass flightClass2 = new FlightClass(450, FlightClassType.FLIGHT_CLASS_TYPE_BUSINESS);

        Seat seat1 = new Seat("1A", true, SeatType.SEAT_TYPE_STANDARD);
        Seat seat2 = new Seat("1B", true, SeatType.SEAT_TYPE_STANDARD);
        Seat seat3 = new Seat("2A", false, SeatType.SEAT_TYPE_EXTRA_LEGROOM);

        Baggage baggage1 = new Baggage(BaggageType.BAGGAGE_TYPE_CARRY_ON); // not sure about baggage type weight..
        Baggage baggage2 = new Baggage(BaggageType.BAGGAGE_TYPE_CHECKED, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_10);
        Baggage baggage3 = new Baggage(BaggageType.BAGGAGE_TYPE_CHECKED, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_20);

        Ticket ticket1 = new Ticket(
                299.99f,
                LocalDateTime.now(),
                TicketStatus.TICKET_STATUS_BOOKED,
                seat1
        );

        ticket1.addBaggage(baggage1);
        ticket1.addBaggage(baggage2);// relation many to many


        flightClass2.addTicket(ticket1);// relationship is one to many but its one flightclass per ticket

        flight1.addTicket(ticket1);

        user1.addTicket(ticket1);


        Ticket ticket2 = new Ticket(
                1099.50f,
                LocalDateTime.now().minusDays(1),
                TicketStatus.TICKET_STATUS_CONFIRMED,
                seat2
        );

        ticket2.addBaggage(baggage1);
        ticket2.addBaggage(baggage3);

        flightClass1.addTicket(ticket2);

        flight1.addTicket(ticket2);

        user1.addTicket(ticket2);

        ticketService.save(ticket1);
        ticketService.save(ticket2);

    }


}
