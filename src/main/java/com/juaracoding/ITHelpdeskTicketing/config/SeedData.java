package com.juaracoding.ITHelpdeskTicketing.config;

import com.juaracoding.ITHelpdeskTicketing.dto.RegisDTO;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class SeedData implements CommandLineRunner{

    @Autowired
    private AuthService authService;

    @Override
    public void run(String... args) throws Exception {

        RegisDTO regisDTO = new RegisDTO();

        regisDTO.setEmployeeName("Admin");
        regisDTO.setUserName("admin.123");
        regisDTO.setEmail("admin.123@gmail.com");
        regisDTO.setNoHp("08123456789");
        regisDTO.setRoleName("ADMINISTRATOR");
        authService.registerEmployee(regisDTO);

    }

}
