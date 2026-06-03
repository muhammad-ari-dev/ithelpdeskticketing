package com.juaracoding.ITHelpdeskTicketing.model;

import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "MstRole", schema = "helpdesk")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Role extends BaseEntity {

    @Column(name = "RoleName", nullable = false, length = 64, unique = true)
    private String roleName;

    @Column(name = "RoleDesc")
    private String roleDesc;
}