package com.juaracoding.ITHelpdeskTicketing.dto.response;

import lombok.Data;

@Data
public class TicketLogDTO {

    private String status;
    private String extraNote;
    private String createdBy;
    private String createdAt;
    
}
