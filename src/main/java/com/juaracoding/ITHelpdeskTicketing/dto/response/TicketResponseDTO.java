package com.juaracoding.ITHelpdeskTicketing.dto.response;

import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class TicketResponseDTO {

    private String id;
    private String ticketCode;
    private String ticketName;
    private String ticketDesc;
    private String status;
    private String deadline;
    private String createdAt;
    private String assignedEmployeeName;
    private List<String> evidences;
    private String assignedAt;
    private String takenAt;
    private String checkedAt;
    private String completedAt;
    private Integer pointsEarned;
    private Integer reopenCount;
    private List<TicketLogDTO> histories;

}
