package com.juaracoding.ITHelpdeskTicketing.dto.validation;

import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TicketProgressDTO {
    @NotBlank(message = ConstantMessage.NOT_BLANK)
    private String extraNote;
}