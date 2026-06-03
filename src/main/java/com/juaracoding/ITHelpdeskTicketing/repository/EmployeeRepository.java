package com.juaracoding.ITHelpdeskTicketing.repository;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {

        Optional<Employee> findByUserName(String userName);
        Optional<Employee> findByEmail(String email);

        // Untuk fitur Lupa Password nanti
        Optional<Employee> findByEmailAndOtpCode(String email, String otpCode);

        boolean existsByUserName(String userName);
        boolean existsByEmail(String email);
    }