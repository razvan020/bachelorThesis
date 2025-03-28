package org.example.xlr8travel.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
@RequestMapping("/loginn")
public class LoginController {

    @GetMapping
    public String login(Model model, @RequestParam(value = "error", required = false) String error) {
        if (error != null) {
            model.addAttribute("errorMessage", "Invalid username or password.");
        }
        return "loginn";  // Make sure 'loginn' matches your login view file name
    }

}