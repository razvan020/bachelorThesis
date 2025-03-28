package org.example.xlr8travel.controllers;

import jakarta.servlet.http.HttpSession;
import org.example.xlr8travel.models.Flight;
import org.example.xlr8travel.services.FlightService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@Controller
@RequestMapping("/cart")
public class CartController {

    private final FlightService flightService;

    public CartController(FlightService flightService) {
        this.flightService = flightService;
    }

    @PostMapping("/add")
    public String addFlightToCart(@RequestParam("flightId") Long flightId, HttpSession session) {
        Flight flight = flightService.findById(flightId);
        List<Flight> cart = (List<Flight>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
        }
        cart.add(flight);
        session.setAttribute("cart", cart);
        return "redirect:/cart";
    }

    @PostMapping("/remove")
    public String removeFlightFromCart(@RequestParam("flightId") Long flightId, HttpSession session) {
        List<Flight> cart = (List<Flight>) session.getAttribute("cart");
        if (cart != null) {
            cart.removeIf(flight -> flight.getId().equals(flightId));
            session.setAttribute("cart", cart);
        }
        return "redirect:/cart";
    }

    @GetMapping
    public String showCart(Model model, HttpSession session) {
        List<Flight> cart = (List<Flight>) session.getAttribute("cart");
        if (cart == null) {
            cart = new ArrayList<>();
        }

        double totalPrice = cart.stream()
                .mapToDouble(Flight::getPrice)
                .sum();

        model.addAttribute("cartItems", cart);
        model.addAttribute("totalPrice", totalPrice);

        return "cart";
    }

}
