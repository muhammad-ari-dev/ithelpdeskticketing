package com.juaracoding.ITHelpdeskTicketing.model;

import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "Ticket", schema = "helpdesk")
@Getter
@Setter
public class Ticket extends BaseEntity {

    @Column(name = "TicketCode", unique = true)
    private UUID ticketCode;

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
    private Employee assignedEmployee;
}