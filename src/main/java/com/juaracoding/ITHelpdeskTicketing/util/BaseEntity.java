package com.juaracoding.ITHelpdeskTicketing.util;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
@MappedSuperclass // Menandakan ini parent class untuk Entity, bukan tabel database
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "Id")
    private UUID id;
    @Column(name = "CreatedBy",nullable = false, updatable = false)
    private String createdBy;
    @CreationTimestamp
    @Column(name = "CreatedAt",nullable = false, updatable = false)
    private LocalDateTime createdAt;
    @Column(name = "UpdatedBy")
    private String updatedBy;
    @UpdateTimestamp
    @Column(name = "UpdatedAt")
    private LocalDateTime updatedAt;
    @Column(name = "DeletedBy",insertable = false)
    private String deletedBy;
    @Column(name = "DeletedAt",insertable = false)
    private LocalDateTime deletedAt;
}