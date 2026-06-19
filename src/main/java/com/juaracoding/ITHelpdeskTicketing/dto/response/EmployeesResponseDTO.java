package com.juaracoding.ITHelpdeskTicketing.dto.response;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Role;
import jakarta.persistence.Column;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
public class EmployeesResponseDTO {

    private UUID id;
    private String employeeName;
    private String userName;
    private String email;
    private String noHp;
    private String status;
    private String roleName;
    private String createdAt;
    private String updatedAt;
    private String leadID;
    private String leaderName;

}
