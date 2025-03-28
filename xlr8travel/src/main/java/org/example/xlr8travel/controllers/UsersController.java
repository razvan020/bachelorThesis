package org.example.xlr8travel.controllers;


import org.example.xlr8travel.models.User;
import org.example.xlr8travel.services.UserService;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
@RequestMapping(value = "/users")
public class UsersController {

    private final UserService userService;

    public UsersController(UserService userService) {
        this.userService = userService;
    }


    @GetMapping
    public String showUsersForm(Model model) {
        List<User> users = userService.findAll();
        model.addAttribute("users", users);
        return "users";
    }

    @PostMapping("/remove/{id}")
    public String removeUser(@PathVariable Long id) {
        userService.removeUserById(id);
        return "redirect:/users";
    }

    @PostMapping("/add")
    public String addUser(@ModelAttribute User user) {
        userService.addUser(user);
        return "redirect:/users"; // Redirect to the user list page after adding the user
    }
}
