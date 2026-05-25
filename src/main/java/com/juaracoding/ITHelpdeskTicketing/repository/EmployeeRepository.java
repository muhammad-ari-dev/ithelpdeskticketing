package com.juaracoding.ITHelpdeskTicketing.repository;

import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;

public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    
}
