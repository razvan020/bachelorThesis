package org.example.xlr8travel.controllers;

import jakarta.servlet.http.HttpSession;
import org.example.xlr8travel.models.Flight;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.List;

@Controller
@RequestMapping("/checkout")
public class CheckoutController {

    @GetMapping
    public String showCheckoutPage(Model model, HttpSession session) {
        List<Flight> cart = (List<Flight>) session.getAttribute("cart");
        if (cart == null || cart.isEmpty()) {
            model.addAttribute("cartItems", List.of());
            model.addAttribute("totalPrice", 0.0);
        } else {
            double totalPrice = cart.stream()
                    .mapToDouble(Flight::getPrice)
                    .sum();
            model.addAttribute("cartItems", cart);
            model.addAttribute("totalPrice", totalPrice);
        }
        return "checkout";
    }

    @PostMapping("/confirm")
    public String confirmPurchase(
            @RequestParam("customerName") String customerName,
            @RequestParam("customerEmail") String customerEmail,
            @RequestParam("cardNumber") String cardNumber,
            HttpSession session,
            Model model
    ) {
        List<Flight> cart = (List<Flight>) session.getAttribute("cart");
        if (cart == null || cart.isEmpty()) {
            model.addAttribute("message", "Your cart is empty. Nothing to purchase.");
            return "purchase-result";
        }

        double totalPrice = cart.stream()
                .mapToDouble(Flight::getPrice)
                .sum();


        session.removeAttribute("cart");

        String confirmationMsg = String.format("Thank you, %s! Your purchase of $%.2f was successful.",
                customerName, totalPrice);
        model.addAttribute("message", confirmationMsg);

        return "purchase-result";
    }
}