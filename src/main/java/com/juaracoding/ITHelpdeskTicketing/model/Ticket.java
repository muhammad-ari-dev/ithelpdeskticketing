package com.juaracoding.ITHelpdeskTicketing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Ticket", schema = "helpdesk")
@Getter
@Setter
public class Ticket extends BaseEntity {

    // UBAH: Sekarang pakai String biar bisa nampung "IT-190626-01"
    @Column(name = "TicketCode", unique = true, length = 32)
    private String ticketCode;

    @Column(name = "TicketName", nullable = false, length = 64)
    private String ticketName;

    @Column(name = "TicketDesc", nullable = false)
    private String ticketDesc;

    @Column(name = "Deadline")
    private LocalDateTime deadline;

    @Column(name = "Status", length = 64)
    private String status = "Open";

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EmployeeID")
    @JsonIgnore
    private Employee assignedEmployee;

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<TicketLog> timelines = new ArrayList<>();

    @OneToMany(mappedBy = "ticket", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Evidence> evidences = new ArrayList<>();
}