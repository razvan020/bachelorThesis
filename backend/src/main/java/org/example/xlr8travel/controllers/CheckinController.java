package org.example.xlr8travel.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.servlet.ModelAndView;

@Controller
@RequestMapping(value = "/checkin")
public class CheckinController {

    @GetMapping("/1")
    public String getCheckinPage() {
        return "checkin";
    }

    @GetMapping("/2")
    public String getCheckinPage2() {
        return "checkin2";
    }

    @GetMapping("/3")
    public ModelAndView getCheckinPage3() {
        return new ModelAndView("checkin3");
    }

    @GetMapping("/4")
    public ModelAndView getCheckinPage4() {
        return new ModelAndView("checkin4");
    }


}


