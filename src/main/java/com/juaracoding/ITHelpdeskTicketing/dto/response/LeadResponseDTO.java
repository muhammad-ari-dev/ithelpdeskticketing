package com.juaracoding.ITHelpdeskTicketing.dto.response;

import lombok.Data;
import java.util.UUID;

@Data
public class LeadResponseDTO {
    private UUID id;
    private String employeeName;
    private String userName;
    private String email;

    // Constructor dari Employee entity
//    public LeadResponseDTO(Employee employee) {
//        this.id = employee.getId();
//        this.employeeName = employee.getEmployeeName();
//        this.userName = employee.getUserName();
//        this.email = employee.getEmail();
//    }
}
