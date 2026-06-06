package com.juaracoding.ITHelpdeskTicketing.dto;

import lombok.Data;

@Data // Biar otomatis bikinin getter setter
public class RegisDTO {
    private String employeeName;
    private String userName;
    private String email;
    private String noHp;
    private String roleName;
    private String leadID;
    // Nanti di service kita cari role-nya berdasarkan nama ini
}