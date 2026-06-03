package com.juaracoding.ITHelpdeskTicketing.controller;

import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.GetMapping;

@RestController
@RequestMapping("api/test")
public class TestController {
    
    @GetMapping("/hello")
    public String hello() {
        return "hello world";
    }
    
}
//single source of truth