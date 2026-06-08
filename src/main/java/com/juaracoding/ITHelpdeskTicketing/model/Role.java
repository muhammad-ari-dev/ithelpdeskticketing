package com.juaracoding.ITHelpdeskTicketing.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MstRole", schema = "helpdesk")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Role extends BaseEntity {

    @Column(name = "RoleName", nullable = false, length = 64, unique = true)
    private String roleName;

    @Column(name = "RoleDesc")
    private String roleDesc;
}