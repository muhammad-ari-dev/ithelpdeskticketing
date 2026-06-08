package com.juaracoding.ITHelpdeskTicketing.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/test")
public class OpenController {

    @GetMapping("/running")
    public String check(){
        return "running";
    }
}
