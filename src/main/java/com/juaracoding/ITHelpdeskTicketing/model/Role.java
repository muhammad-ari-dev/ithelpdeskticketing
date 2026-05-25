package com.juaracoding.ITHelpdeskTicketing.model;

import org.hibernate.annotations.Comment;

import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "MstRole", schema = "master")
@Comment("Tabel Role")
public class Role {
    
}
