package com.juaracoding.ITHelpdeskTicketing.dto;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import lombok.Data;
import java.util.UUID;

@Data
public class LoginResponseDTO {
    private UUID id;
    private String employeeName;
    private String userName;
    private String email;
    private String roleName;

    public LoginResponseDTO(Employee employee) {
        this.id = employee.getId();
        this.employeeName = employee.getEmployeeName();
        this.userName = employee.getUserName();
        this.email = employee.getEmail();
        this.roleName = employee.getRole().getRoleName(); // "ADMINISTRATOR", "LEAD", "EMPLOYEE"
    }
}
