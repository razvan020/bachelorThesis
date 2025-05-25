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
        Country country4 = new Country("Netherlands");
        Country country5 = new Country("Spain");
        Country country6 = new Country("Greece");
        Country country7 = new Country("Switzerland");
        Country country8 = new Country("France");

        City city1 = new City("Bucharest");
        City city2 = new City("Cluj");
        City city3 = new City("Munich");
        City city4 = new City("Berlin");
        City city5 = new City("Rome");
        City city6 = new City("Milan");
        City city7 = new City("Amsterdam");
        City city8 = new City("Madrid");
        City city9 = new City("Athens");
        City city10 = new City("Zurich");
        City city11 = new City("Paris");
        //City city12 = new City("Chisinau"); add a city without a country ...


        country1.addCity(city1);
        country1.addCity(city2);
        country2.addCity(city3);
        country2.addCity(city4);
        country3.addCity(city5);
        country3.addCity(city6);
        country4.addCity(city7);
        country5.addCity(city8);
        country6.addCity(city9);
        country7.addCity(city10);
        country8.addCity(city11);


        Airport airport1 = new Airport( "Henri Coanda", "OTP", city1);
        Airport airport2 = new Airport( "Avram Iancu", "CLJ", city2);
        Airport airport3 = new Airport( "Franz Josef Strauss", "MUC", city3);
        Airport airport4 = new Airport( "Berlin Brandenburg", "BER", city4);
        Airport airport5 = new Airport( "Leonardo da Vinci Fiumicino", "FCO", city5);
        Airport airport6 = new Airport( "Milano Malpensa", "MXP", city6);
        Airport airport7 = new Airport( "Amsterdam Schiphol", "AMS", city7);
        Airport airport8 = new Airport( "Adolfo Suárez Madrid–Barajas", "MAD", city8);
        Airport airport9 = new Airport( "Athens International", "ATH", city9);
        Airport airport10 = new Airport( "Zurich Airport", "ZRH", city10);
        Airport airport11 = new Airport( "Charles de Gaulle Airport", "CDG", city11);

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

        Route route5 =  new Route(1800, LocalTime.of(2,45));
          route5.setSourceAirport(airport1);
          route5.setDestinationAirport(airport7);

        Route route6 =  new Route(1800, LocalTime.of(2,45));
          route6.setSourceAirport(airport7);
          route6.setDestinationAirport(airport1);

        // Routes for Madrid (MAD)
        Route route7 =  new Route(2300, LocalTime.of(3,30));
          route7.setSourceAirport(airport1);
          route7.setDestinationAirport(airport8);

        Route route8 =  new Route(2300, LocalTime.of(3,30));
          route8.setSourceAirport(airport8);
          route8.setDestinationAirport(airport1);

        // Routes for Athens (ATH)
        Route route9 =  new Route(1500, LocalTime.of(2,15));
          route9.setSourceAirport(airport1);
          route9.setDestinationAirport(airport9);

        Route route10 =  new Route(1500, LocalTime.of(2,15));
          route10.setSourceAirport(airport9);
          route10.setDestinationAirport(airport1);

        // Routes for Zurich (ZRH)
        Route route11 =  new Route(1600, LocalTime.of(2,30));
          route11.setSourceAirport(airport1);
          route11.setDestinationAirport(airport10);

        Route route12 =  new Route(1600, LocalTime.of(2,30));
          route12.setSourceAirport(airport10);
          route12.setDestinationAirport(airport1);

        // Routes for Paris (CDG)
        Route route13 =  new Route(1800, LocalTime.of(3,0));
          route13.setSourceAirport(airport1);
          route13.setDestinationAirport(airport11);

        Route route14 =  new Route(1800, LocalTime.of(3,0));
          route14.setSourceAirport(airport11);
          route14.setDestinationAirport(airport1);


        Aircraft aircraft1 = new Aircraft("Boeing 747", "Boeing", "Passenger", 416, 5240,
                "WiFi, Food, Entertainment", "987,000 kg", 66160,
                14200, 8800);

        Aircraft aircraft2 = new Aircraft("Cessna 172", "Cessna", "Private", 4, 120,
                "Basic amenities", "1,202 kg", 56,
                1710, 1062);


        //single Airline
        Airline airline = new Airline("xlr8Travel", "XT");
//test commit
        //testcommit2
        airline.addAircraft(aircraft1);
        airline.addAircraft(aircraft2);
        airline.addRoute(route1);
        airline.addRoute(route2);
        airline.addRoute(route3);
        airline.addRoute(route4);
        airline.addRoute(route5);
        airline.addRoute(route6);
        airline.addRoute(route7);
        airline.addRoute(route8);
        airline.addRoute(route9);
        airline.addRoute(route10);
        airline.addRoute(route11);
        airline.addRoute(route12);
        airline.addRoute(route13);
        airline.addRoute(route14);

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
                BigDecimal.valueOf(30.0)); // Price in EUR

        // LHR to LAX flight (return) - 3 days later
        Flight flight5 = new Flight(null, "Flight 102", LocalTime.of(10, 30), LocalTime.of(16, 30),
                "LHR", "LAX", returnDate1, returnDate1, "D", "10", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(50.0)); // Price in EUR

        // LHR to LAX flight (return) - 7 days later
        Flight flight6 = new Flight(null, "Flight 103", LocalTime.of(15, 45), LocalTime.of(21, 45),
                "LHR", "LAX", returnDate2, returnDate2, "B", "12", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(44.0)); // Price in EUR

        // Romania to Italy flight
        Flight flight2 = new Flight(null, "Flight 202", LocalTime.of(9, 15), LocalTime.of(11, 30),
                "Romania", "Italy", baseDate, baseDate, "A", "1", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(40.0)); // Price in EUR

        // Italy to Romania flight (return) - 3 days later
        Flight flight7 = new Flight(null, "Flight 203", LocalTime.of(12, 45), LocalTime.of(15, 00),
                "Italy", "Romania", returnDate1, returnDate1, "C", "5", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(38.0)); // Price in EUR

        // Another LAX to LHR flight (different time)
        Flight flightdep = new Flight(null, "Flight 104", LocalTime.of(14, 30), LocalTime.of(20, 30),
                "LAX", "LHR", baseDate, baseDate,
                "A", "1", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(40.0)); // Price in EUR

        // Germany to Italy flight
        Flight flight3 = new Flight(null, "Flight 300", LocalTime.of(7, 30), LocalTime.of(9, 30),
                "Germany", "Italy", baseDate, baseDate, "R", "10", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(40.0)); // Price in EUR

        // Another Germany to Italy flight (different time)
        Flight flight4 = new Flight(null, "Flight 301", LocalTime.of(16, 30), LocalTime.of(18, 30),
                "Germany", "Italy", baseDate, baseDate, "D", "10", LocalDateTime.now(),
                airline,
                new HashSet<Ticket>(),
                BigDecimal.valueOf(50.0)); // Price in EUR


        // Add all flights to the airline
        airline.addFlight(flight1);
        airline.addFlight(flight2);
        airline.addFlight(flight3);
        airline.addFlight(flight4);
        airline.addFlight(flight5);
        airline.addFlight(flight6);
        airline.addFlight(flight7);
        airline.addFlight(flightdep);

        // Create flights from OTP (Bucharest) to different destinations
        LocalDate today = LocalDate.now();
        LocalDate tomorrow = today.plusDays(1);
        LocalDate nextWeek = today.plusDays(7);

        // OTP to Barcelona (BCN)
        Flight otpToBcn1 = new Flight(null, "XT-OTP-BCN-1", LocalTime.of(8, 30), LocalTime.of(10, 45),
                "OTP", "BCN", tomorrow, tomorrow, "B", "5", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(29.99)); // Price in EUR

        Flight otpToBcn2 = new Flight(null, "XT-OTP-BCN-2", LocalTime.of(16, 15), LocalTime.of(18, 30),
                "OTP", "BCN", nextWeek, nextWeek, "C", "7", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(35.99)); // Price in EUR

        // OTP to London (LHR)
        Flight otpToLhr1 = new Flight(null, "XT-OTP-LHR-1", LocalTime.of(7, 45), LocalTime.of(9, 30),
                "OTP", "LHR", tomorrow, tomorrow, "A", "3", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(39.99)); // Price in EUR

        Flight otpToLhr2 = new Flight(null, "XT-OTP-LHR-2", LocalTime.of(14, 30), LocalTime.of(16, 15),
                "OTP", "LHR", nextWeek, nextWeek, "D", "8", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(43.99)); // Price in EUR

        // OTP to Paris (CDG)
        Flight otpToCdg1 = new Flight(null, "XT-OTP-CDG-1", LocalTime.of(9, 15), LocalTime.of(11, 30),
                "OTP", "CDG", tomorrow, tomorrow, "E", "2", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(31.99)); // Price in EUR

        Flight otpToCdg2 = new Flight(null, "XT-OTP-CDG-2", LocalTime.of(18, 45), LocalTime.of(21, 00),
                "OTP", "CDG", nextWeek, nextWeek, "F", "4", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(37.99)); // Price in EUR

        // OTP to Rome (FCO)
        Flight otpToFco1 = new Flight(null, "XT-OTP-FCO-1", LocalTime.of(10, 30), LocalTime.of(12, 15),
                "OTP", "FCO", tomorrow, tomorrow, "G", "6", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(27.99)); // Price in EUR

        Flight otpToFco2 = new Flight(null, "XT-OTP-FCO-2", LocalTime.of(17, 30), LocalTime.of(19, 15),
                "OTP", "FCO", nextWeek, nextWeek, "H", "9", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(33.99)); // Price in EUR

        // OTP to Amsterdam (AMS)
        Flight otpToAms1 = new Flight(null, "XT-OTP-AMS-1", LocalTime.of(9, 00), LocalTime.of(11, 45),
                "OTP", "AMS", tomorrow, tomorrow, "I", "10", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(35.99)); // Price in EUR

        Flight otpToAms2 = new Flight(null, "XT-OTP-AMS-2", LocalTime.of(16, 00), LocalTime.of(18, 45),
                "OTP", "AMS", nextWeek, nextWeek, "J", "12", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(39.99)); // Price in EUR

        // AMS to OTP
        Flight amsToOtp1 = new Flight(null, "XT-AMS-OTP-1", LocalTime.of(12, 30), LocalTime.of(15, 15),
                "AMS", "OTP", tomorrow, tomorrow, "K", "14", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(37.99)); // Price in EUR

        Flight amsToOtp2 = new Flight(null, "XT-AMS-OTP-2", LocalTime.of(19, 30), LocalTime.of(22, 15),
                "AMS", "OTP", nextWeek, nextWeek, "L", "16", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(41.99)); // Price in EUR

        // Add all new flights to the airline
        airline.addFlight(otpToBcn1);
        airline.addFlight(otpToBcn2);
        airline.addFlight(otpToLhr1);
        airline.addFlight(otpToLhr2);
        airline.addFlight(otpToCdg1);
        airline.addFlight(otpToCdg2);
        airline.addFlight(otpToFco1);
        airline.addFlight(otpToFco2);
        airline.addFlight(otpToAms1);
        airline.addFlight(otpToAms2);
        airline.addFlight(amsToOtp1);
        airline.addFlight(amsToOtp2);

        // Save all flights to the database
        flightService.save(flight1);
        flightService.save(flight2);
        flightService.save(flight3);
        flightService.save(flight4);
        flightService.save(flight5);
        flightService.save(flight6);
        flightService.save(flight7);
        flightService.save(flightdep);

        // Create flights from OTP to Madrid (MAD)
        Flight otpToMad1 = new Flight(null, "XT-OTP-MAD-1", LocalTime.of(8, 30), LocalTime.of(12, 00),
                "OTP", "MAD", tomorrow, tomorrow, "B", "5", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(45.99)); // Price in EUR

        Flight otpToMad2 = new Flight(null, "XT-OTP-MAD-2", LocalTime.of(16, 15), LocalTime.of(19, 45),
                "OTP", "MAD", nextWeek, nextWeek, "C", "7", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(52.99)); // Price in EUR

        // Create flights from Madrid to OTP
        Flight madToOtp1 = new Flight(null, "XT-MAD-OTP-1", LocalTime.of(13, 00), LocalTime.of(16, 30),
                "MAD", "OTP", tomorrow, tomorrow, "D", "8", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(48.99)); // Price in EUR

        Flight madToOtp2 = new Flight(null, "XT-MAD-OTP-2", LocalTime.of(20, 30), LocalTime.of(23, 59),
                "MAD", "OTP", nextWeek, nextWeek, "E", "9", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(55.99)); // Price in EUR

        // Create flights from OTP to Athens (ATH)
        Flight otpToAth1 = new Flight(null, "XT-OTP-ATH-1", LocalTime.of(9, 15), LocalTime.of(11, 30),
                "OTP", "ATH", tomorrow, tomorrow, "F", "10", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(42.99)); // Price in EUR

        Flight otpToAth2 = new Flight(null, "XT-OTP-ATH-2", LocalTime.of(17, 30), LocalTime.of(19, 45),
                "OTP", "ATH", nextWeek, nextWeek, "G", "11", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(49.99)); // Price in EUR

        // Create flights from Athens to OTP
        Flight athToOtp1 = new Flight(null, "XT-ATH-OTP-1", LocalTime.of(12, 30), LocalTime.of(14, 45),
                "ATH", "OTP", tomorrow, tomorrow, "H", "12", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(45.99)); // Price in EUR

        Flight athToOtp2 = new Flight(null, "XT-ATH-OTP-2", LocalTime.of(20, 30), LocalTime.of(22, 45),
                "ATH", "OTP", nextWeek, nextWeek, "I", "13", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(52.99)); // Price in EUR

        // Create flights from OTP to Zurich (ZRH)
        Flight otpToZrh1 = new Flight(null, "XT-OTP-ZRH-1", LocalTime.of(7, 45), LocalTime.of(10, 15),
                "OTP", "ZRH", tomorrow, tomorrow, "J", "14", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(47.99)); // Price in EUR

        Flight otpToZrh2 = new Flight(null, "XT-OTP-ZRH-2", LocalTime.of(15, 30), LocalTime.of(18, 00),
                "OTP", "ZRH", nextWeek, nextWeek, "K", "15", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(54.99)); // Price in EUR

        // Create flights from Zurich to OTP
        Flight zrhToOtp1 = new Flight(null, "XT-ZRH-OTP-1", LocalTime.of(11, 15), LocalTime.of(13, 45),
                "ZRH", "OTP", tomorrow, tomorrow, "L", "16", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(50.99)); // Price in EUR

        Flight zrhToOtp2 = new Flight(null, "XT-ZRH-OTP-2", LocalTime.of(19, 00), LocalTime.of(21, 30),
                "ZRH", "OTP", nextWeek, nextWeek, "M", "17", LocalDateTime.now(),
                airline, new HashSet<Ticket>(), BigDecimal.valueOf(57.99)); // Price in EUR

        // Add all new flights to the airline
        airline.addFlight(otpToMad1);
        airline.addFlight(otpToMad2);
        airline.addFlight(madToOtp1);
        airline.addFlight(madToOtp2);
        airline.addFlight(otpToAth1);
        airline.addFlight(otpToAth2);
        airline.addFlight(athToOtp1);
        airline.addFlight(athToOtp2);
        airline.addFlight(otpToZrh1);
        airline.addFlight(otpToZrh2);
        airline.addFlight(zrhToOtp1);
        airline.addFlight(zrhToOtp2);

        // Save all new OTP flights
        flightService.save(otpToBcn1);
        flightService.save(otpToBcn2);
        flightService.save(otpToLhr1);
        flightService.save(otpToLhr2);
        flightService.save(otpToCdg1);
        flightService.save(otpToCdg2);
        flightService.save(otpToFco1);
        flightService.save(otpToFco2);
        flightService.save(otpToAms1);
        flightService.save(otpToAms2);
        flightService.save(amsToOtp1);
        flightService.save(amsToOtp2);

        // Save all new Madrid, Athens, and Zurich flights
        flightService.save(otpToMad1);
        flightService.save(otpToMad2);
        flightService.save(madToOtp1);
        flightService.save(madToOtp2);
        flightService.save(otpToAth1);
        flightService.save(otpToAth2);
        flightService.save(athToOtp1);
        flightService.save(athToOtp2);
        flightService.save(otpToZrh1);
        flightService.save(otpToZrh2);
        flightService.save(zrhToOtp1);
        flightService.save(zrhToOtp2);

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
