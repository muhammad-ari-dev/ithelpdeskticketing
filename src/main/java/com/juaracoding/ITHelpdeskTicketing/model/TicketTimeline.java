package com.juaracoding.ITHelpdeskTicketing.model;

import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "TicketTimeline",schema = "helpdesk")
@Getter
@Setter
public class TicketTimeline extends BaseEntity {


    @Column(name = "Status", nullable = false, length = 64)
    private String status;

    @Column(name = "ExtraNote")
    private String extraNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TicketID", nullable = false)
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EmployeeID", nullable = false)
    private Employee employee;
}

