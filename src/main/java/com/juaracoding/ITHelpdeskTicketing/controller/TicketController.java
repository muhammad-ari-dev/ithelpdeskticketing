package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.validation.CreateTicketDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.TicketProgressDTO;
import com.juaracoding.ITHelpdeskTicketing.service.TicketService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ticket")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @GetMapping("/tickets")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> getTickets(
            HttpServletRequest request
    ){
        return ticketService.getTickets(request);
    }

    @GetMapping("/ticket/{ticketCode}")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> getTicket(
            @PathVariable String ticketCode,
            HttpServletRequest request
    ){
        return ticketService.getTicket(ticketCode, request);
    }

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> createTicket(
            @AuthenticationPrincipal UserDetails userDetails,
            @Valid @ModelAttribute CreateTicketDTO dto,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request) {
        return ticketService.createTicket(dto, files, userDetails.getUsername(), request);
    }

    @GetMapping("/my-tickets")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> getMyTickets(
            @AuthenticationPrincipal UserDetails userDetails,
            HttpServletRequest request) {
        return ticketService.getEmployeeTickets(userDetails.getUsername(), request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/start/{ticketCode}")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> startTicket(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String ticketCode,
            HttpServletRequest request) {
        return ticketService.startProgress(ticketCode, userDetails.getUsername(), request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/submit-check/{ticketCode}")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> submitToCheck(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String ticketCode,
            @Valid @RequestBody TicketProgressDTO dto,
            HttpServletRequest request) {
        return ticketService.submitToCheck(ticketCode, dto, userDetails.getUsername(), request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/approve/{ticketCode}")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> approveTicket(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String ticketCode,
            @Valid @RequestBody TicketProgressDTO dto,
            HttpServletRequest request) {
        return ticketService.approveTicket(ticketCode, dto, userDetails.getUsername(), request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/reject/{ticketCode}")
    @SecurityRequirement(name = "helpdesk-api")
    public ResponseEntity<Object> rejectTicket(
            @AuthenticationPrincipal UserDetails userDetails,
            @PathVariable String ticketCode,
            @Valid @RequestBody TicketProgressDTO dto,
            HttpServletRequest request) {
        return ticketService.rejectTicket(ticketCode, dto, userDetails.getUsername(), request);
    }
}