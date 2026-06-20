package com.juaracoding.ITHelpdeskTicketing.repository;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface EmployeeRepo extends JpaRepository<Employee, UUID> {
        Optional<Employee> findByUserName(String userName);
        Optional<Employee> findByMagicToken(String token);

        // Ini buat narik daftar Leader
        List<Employee> findByRole_RoleNameIgnoreCase(String roleName);

        boolean existsByUserName(String userName);
        boolean existsByEmail(String email);

        @Query("""
                SELECT e FROM Employee e
                ORDER BY
                    CASE WHEN e.lead IS NULL THEN 0 ELSE 1 END,
                    e.employeeName ASC
                """)
        List<Employee> findAllOrphanFirst();
        List<Employee> findByLead(Employee lead);
}
