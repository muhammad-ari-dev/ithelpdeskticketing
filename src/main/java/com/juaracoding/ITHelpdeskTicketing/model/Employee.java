package com.juaracoding.ITHelpdeskTicketing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "MstEmployee",schema = "helpdesk")
@Getter
@Setter
public class Employee extends BaseEntity {

    @Column(name = "EmployeeName", nullable = false, length = 64)
    private String employeeName;

    @Column(name = "UserName", nullable = false, length = 64, unique = true)
    private String userName;

    @Column(name = "Password", nullable = false)
    private String password;

    @Column(name = "Email", nullable = false, unique = true)
    private String email;

    @Column(name = "NoHp", nullable = false, unique = true, length = 20)
    private String noHp;

    // 1: Menggantikan isActive & isFirstLogin
    @Column(name = "AccountStatus", nullable = false, length = 32)
    private String accountStatus;

    @Column(name = "MagicToken", unique = true)
    private String magicToken; // 1: Tempat nyimpen token link email

    @Column(name = "MagicTokenExpiryAt")
    private LocalDateTime magicTokenExpiryAt; // 2: Batas waktu link (misal 24 jam)

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "RoleID", nullable = false)
    @JsonIgnore
    private Role role;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "LeadID")
    @JsonIgnore
    private Employee lead;
}