package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class EmployeeController {

    private final EmployeeRepository employeeRepository;

    @GetMapping("/leaders")
    public List<Employee> getLeaders() {
        // Harus "Lead" sesuai di Navicat lu
        return employeeRepository.findByRoleRoleName("Lead");
    }
}