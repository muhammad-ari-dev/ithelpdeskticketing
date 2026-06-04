package com.juaracoding.ITHelpdeskTicketing.repository;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
        Optional<Employee> findByUserName(String userName);
        Optional<Employee> findByEmail(String email);
        Optional<Employee> findByMagicToken(String token);

        // Ini buat narik daftar Leader
        List<Employee> findByRoleRoleName(String roleName);

        boolean existsByUserName(String userName);
        boolean existsByEmail(String email);
}