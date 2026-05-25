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
@Table(name = "MstRole", schema = "master")
@Comment("Tabel Role")
public class Role extends BaseEntity {
    
    @Column(name = "name", nullable = false, length = 64)
    private String name;
    @Column(name = "description", length = 255)
    private String description;

}
