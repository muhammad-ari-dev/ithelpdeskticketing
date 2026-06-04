package com.juaracoding.ITHelpdeskTicketing.dto;

import lombok.Data;
import java.util.UUID;

@Data // 1
public class EmployeeRequest {

    private String employeeName; // 2
    private String userName;
    private String email;
    private String noHp;

    private String roleName; // 3
    private UUID leadId; // 4
}