package com.juaracoding.ITHelpdeskTicketing.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.juaracoding.ITHelpdeskTicketing.util.BaseEntity;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "Evidence",schema = "helpdesk")
@Getter
@Setter

public class Evidence extends BaseEntity {


        @Column(name = "EvidenceLink", nullable = false)
        private String evidenceLink;

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "TicketID", nullable = false)
        @JsonIgnore
        private Ticket ticket;
    }

