package com.juaracoding.ITHelpdeskTicketing.dto.validation;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateTicketDTO {

    @NotBlank(message = ConstantMessage.NOT_BLANK)
    private String ticketName;

    @NotBlank(message = ConstantMessage.NOT_BLANK)
    private String ticketDesc;

    // File fotonya TIDAK ditaruh di sini, melainkan di parameter Controller nanti

    // WAJIB ADA: Untuk menangkap ID Employee yang dipilih oleh LEAD dari dropdown Frontend
    @NotBlank(message = ConstantMessage.NOT_BLANK)
    private String assignedEmployeeId;

    @NotBlank(message = ConstantMessage.NOT_BLANK)
    private String deadline;
}