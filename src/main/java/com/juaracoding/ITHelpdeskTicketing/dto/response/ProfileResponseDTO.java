package com.juaracoding.ITHelpdeskTicketing.dto.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class ProfileResponseDTO {

    private String employeeName;
    private String username;
    private String roleName;
    private String roleDesc;
    private String createdAt;

}