package com.juaracoding.ITHelpdeskTicketing.model;

import org.hibernate.annotations.Comment;

import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "MstEmployee", schema = "master")
@Comment("Tabel Employee")
public class Employee extends BaseEntity {
    
    @Column(name = "name", nullable = false, length = 64)
    private String name;
    @Column(name = "userName", nullable = false, unique = true, length = 64)
    private String userName;
    @Column(name = "password", nullable = false, length = 64, unique = true)
    private String password;
    @Column(name = "email", nullable = false, unique = true, length = 255)
    private String email;
    @Column(name = "noHp", nullable = false, unique = true, length = 20)
    private String noHp;
    @Column(name = "otp", length = 64)
    private String otp;


    
}
