package org.example.xlr8travel.controllers;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.example.xlr8travel.models.Country;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.repositories.CountryRepository;
import org.example.xlr8travel.services.CountryService;
import org.example.xlr8travel.services.FlightService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

@Controller
@RequestMapping({"/", "/index"})
@RequiredArgsConstructor
public class HomeController {

    private final CountryRepository countryRepository;
    private final CountryService countryService;
    private final FlightService flightService;

    @GetMapping("/autocomplete")
    @ResponseBody
    public List<String> getSelectCountry(@RequestParam("term") String term) {
        return countryService.search(term);
    }

    @GetMapping("/getFlightData")
    @ResponseBody
    public List<Flight> getFlights(@RequestParam("origin") String origin, @RequestParam("destination") String destination, @RequestParam("arrivalDate") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS") LocalDate arrivalDate, @RequestParam("departureDate") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS") LocalDate departureDate) {
        System.out.println("Origin: " + origin);
        System.out.println("Destination: " + destination);
        System.out.println("Arrival Date: " + arrivalDate);
        System.out.println("Departure Date: " + departureDate);

        return flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(origin, destination, arrivalDate, departureDate);
    }

    @PostMapping("/getAvailableFlights")
    public String getAvailableFlights(@RequestParam("origin") String origin, @RequestParam("destination") String destination, @RequestParam("arrivalDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate arrivalDate, @RequestParam("departureDate") @DateTimeFormat(pattern = "yyyy-MM-dd") LocalDate departureDate, Model model) {
        System.out.println("Origin: " + origin);
        System.out.println("Destination: " + destination);
        System.out.println("Arrival Date: " + arrivalDate);
        System.out.println("Departure Date: " + departureDate);

        List<Flight> availableFlights = flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(origin, destination, arrivalDate, departureDate);
        model.addAttribute("availableFlights", availableFlights);
        return "flights";
    }

    @GetMapping("/getAvailableFlights")
    public String getAvailableFlights2(@RequestParam("origin") String origin, @RequestParam("destination") String destination, @RequestParam("arrivalDate") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS") LocalDate arrivalDate, @RequestParam("departureDate") @DateTimeFormat(pattern = "yyyy-MM-dd HH:mm:ss.SSS") LocalDate departureDate, Model model) {
        List<Flight> availableFlights = flightService.findByOriginAndDestinationAndArrivalDateAndDepartureDate(origin, destination, arrivalDate, departureDate);
        model.addAttribute("availableFlights", availableFlights);
        return "flights";
    }



    @PostMapping("/sendData")
    public String selectCountry(@ModelAttribute("country") Country country, Model model) {
        model.addAttribute("selectedCountryName", country.getName());
        model.addAttribute("country", country);
        List<Country> countryList = countryRepository.findAll();
        model.addAttribute("countryList", countryList);
        return "redirect:index";
    }

    @GetMapping()
    public String list2(final Model model) {
        return "index";
    }
}
