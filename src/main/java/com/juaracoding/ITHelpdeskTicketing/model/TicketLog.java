package com.juaracoding.ITHelpdeskTicketing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;


@Entity
@Table(name = "TicketLog",schema = "helpdesk")
@Getter
@Setter
public class TicketLog extends BaseEntity {


    @Column(name = "Status", nullable = false, length = 64)
    private String status;

    @Column(name = "ExtraNote")
    private String extraNote;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "TicketID", nullable = false)
    @JsonIgnore
    private Ticket ticket;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "EmployeeID", nullable = false)
    @JsonIgnore
    private Employee employee;
}

