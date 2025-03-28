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
        LocalDate date = LocalDate.of(2025, 1, 13);
        Flight flight1 = new Flight(null, "Flight 101", LocalTime.of(3, 30), LocalTime.of(6, 30), "Romania", "Germany",date, date, "A", "1", LocalDateTime.now(), null, new HashSet<>(),150.0);
        Flight flight2 = new Flight(null, "Flight 101", LocalTime.of(3, 30), LocalTime.of(6, 30), "Romania", "Italy",date, date, "A", "1", LocalDateTime.now(), null, new HashSet<>(), 200.0);
        Flight flight3 = new Flight(null, "Flight 300", LocalTime.of(3, 30), LocalTime.of(6, 30), "Germany", "Italy",date, date, "R", "10", LocalDateTime.now(), null, new HashSet<>(), 200.0);
        Flight flight4 = new Flight(null, "Flight 301", LocalTime.of(3, 30), LocalTime.of(6, 30), "Germany", "Italy",date, date, "D", "10", LocalDateTime.now(), null, new HashSet<>(), 250.0);
        airline.addFlight(flight1);
        airline.addFlight(flight2);
        airline.addFlight(flight3);
        airline.addFlight(flight4);

        flightService.save(flight1);
        flightService.save(flight2);
        flightService.save(flight3);
        flightService.save(flight4);
        System.out.println(flight1.getArrivalDate().toString());
        System.out.println(flight1.getDepartureDate().toString());
        System.out.println(flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate("Romania","Germany",flight1.getArrivalDate(),flight1.getDepartureDate()));

  //     --------------------------------------------------------------

        Address address1 = new Address("Str. Dorobanti");
        Address address2 = new Address("Str. Hochenheimer");

       city1.addAddress(address1); // work with DTO!!!!
        city3.addAddress(address2); // can't save address without saving the person


        PasswordEncoder bcrypt = new BCryptPasswordEncoder();
        User user1 = new User("Mihai", "Spanu", "user1", 34, "M","spanumihai@yahoo.com",bcrypt.encode("user1"), LocalDate.of(2000,03,15), Account_Status.ACCOUNT_STATUS_ACTIVE );
        user1.getRoles().add(Role.ROLE_USER);

        user1.addAddress(address1);


        User user2=new User("user2",bcrypt.encode("user2"),"a@y.com");
        user2.getRoles().add(Role.ROLE_ADMIN);

        userService.save(user1);
        userService.save(user2);

        //----------------------------------------------------------------------

        FlightClass flightClass1 = new FlightClass(230, FlightClassType.FLIGHT_CLASS_TYPE_ECONOMY);
        FlightClass flightClass2 = new FlightClass(450, FlightClassType.FLIGHT_CLASS_TYPE_BUSINESS);

        Seat seat1 = new Seat("1A", true, SeatType.SEAT_TYPE_STANDARD);
        Seat seat2 = new Seat("1B", true, SeatType.SEAT_TYPE_STANDARD);
        Seat seat3 = new Seat("2A", false, SeatType.SEAT_TYPE_EXTRA_LEGROOM);

        Baggage baggage1 = new Baggage(BaggageType.BAGGAGE_TYPE_CARRY_ON); // not sure about baggage type weight..
        Baggage baggage2 = new Baggage(BaggageType.BAGGAGE_TYPE_CHECKED, BaggageTypeWeight.BAGGAGE_TYPE_WEIGHT_CHECKED_15);
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
