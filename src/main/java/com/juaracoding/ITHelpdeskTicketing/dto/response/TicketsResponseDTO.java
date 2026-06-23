package com.juaracoding.ITHelpdeskTicketing.dto.response;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class TicketsResponseDTO {

    private String ticketCode;
    private String ticketName;
    private String status;
    private String deadline;
    private String assignedEmployeeName;
    private String createdAt;

}
