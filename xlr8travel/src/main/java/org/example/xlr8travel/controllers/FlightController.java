package org.example.xlr8travel.controllers;

import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.services.FlightService;
import org.springframework.security.access.annotation.Secured;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller
@RequestMapping("/flights")
public class FlightController {

    private final FlightService flightService;

    public FlightController(FlightService flightService) {
        this.flightService = flightService;
    }

    @Secured("ROLE_ADMIN")
    @GetMapping("/add")
    public String showAddFlightForm(Model model,
                                    @RequestParam(value = "success", required = false) String success) {
        model.addAttribute("flight", new Flight());

        // If the query param ?success=1 is present, add a success message
        if (success != null) {
            model.addAttribute("successMessage", "Flight added successfully!");
        }
        return "addFlight"; // Renders addFlight.html
    }

    @Secured("ROLE_ADMIN")
    @PostMapping("/add")
    public String addFlight(@ModelAttribute("flight") Flight flight) {
        // Save the new flight
        flightService.save(flight);

        // Redirect back to the same page with a success indicator
        return "redirect:/flights/add?success=1";
    }

    // Show list of flights (manage page)
    @GetMapping("/manage")
    public String manageFlights(Model model,
                                @RequestParam(value = "success", required = false) String success,
                                @RequestParam(value = "deleted", required = false) String deleted) {
        var flights = flightService.findAll();
        model.addAttribute("flights", flights);

        // If we have a success param, show update message
        if (success != null) {
            model.addAttribute("successMessage", "Flight updated successfully!");
        }

        // If we have a deleted param, show delete message
        if (deleted != null) {
            model.addAttribute("successMessage", "Flight deleted successfully!");
        }

        return "manageFlights";
    }

    // Display form to edit a flight
    @GetMapping("/edit/{id}")
    public String editFlightForm(@PathVariable("id") Long flightId, Model model) {
        Flight existingFlight = flightService.findById(flightId);
        if (existingFlight == null) {
            // If flight not found, redirect or show error
            return "redirect:/flights/manage";
        }
        model.addAttribute("flight", existingFlight);
        return "editFlight";
    }

    // Update flight (POST)
    @PostMapping("/edit")
    public String updateFlight(@ModelAttribute("flight") Flight flight) {
        flightService.updateFlight(flight);
        return "redirect:/flights/manage?success=1";
    }

    // ===== NEW: Delete flight (POST) =====
    @PostMapping("/delete/{id}")
    public String deleteFlight(@PathVariable("id") Long flightId) {
        flightService.deleteFlightById(flightId);
        return "redirect:/flights/manage?deleted=1";
    }

}