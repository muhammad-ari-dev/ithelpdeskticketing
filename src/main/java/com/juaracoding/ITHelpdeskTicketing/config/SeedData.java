package com.juaracoding.ITHelpdeskTicketing.config;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.RoleRepo;
import com.juaracoding.ITHelpdeskTicketing.security.BcryptImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class SeedData implements CommandLineRunner{

    @Autowired
    private RoleRepo roleRepo;

    @Autowired
    private EmployeeRepo employeeRepo;

    @Override
    public void run(String... args) throws Exception {

        if(roleRepo.count() == 0) {

            Role administrator = new Role();
            Role lead = new Role();
            Role employee = new Role();

            administrator.setRoleName("ADMINISTRATOR");
            administrator.setCreatedBy("SYSTEM");

            lead.setRoleName("LEAD");
            lead.setCreatedBy("SYSTEM");

            employee.setRoleName("EMPLOYEE");
            employee.setCreatedBy("SYSTEM");

            roleRepo.save(administrator);
            roleRepo.save(lead);
            roleRepo.save(employee);

        }

        if (!employeeRepo.existsByEmail("admin.123@gmail.com")) {

            Role roleAdmin = roleRepo.findByRoleName("ADMINISTRATOR")
                    .orElseThrow(() -> new RuntimeException("Administrator Role not found!"));

            Employee admin = new Employee();

            admin.setEmployeeName("Admin");
            admin.setUserName("admin.123");
            admin.setEmail("admin.123@gmail.com");
            admin.setNoHp("08123456789");
            admin.setPassword(BcryptImpl.hash(admin.getUserName() + "admin@123"));
            admin.setLead(null);
            admin.setAccountStatus("ACTIVE");
            admin.setRole(roleAdmin);
            admin.setCreatedBy("SYSTEM");

            employeeRepo.save(admin);

        }
    }
}
