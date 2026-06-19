package com.juaracoding.ITHelpdeskTicketing.controller;

import com.juaracoding.ITHelpdeskTicketing.dto.validation.CreateTicketDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.TicketProgressDTO;
import com.juaracoding.ITHelpdeskTicketing.service.TicketService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/ticket")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @PostMapping(value = "/create", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Object> createTicket(
            @Valid @ModelAttribute CreateTicketDTO dto,
            @RequestParam(value = "files", required = false) List<MultipartFile> files,
            HttpServletRequest request) {

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ticketService.createTicket(dto, files, username, request);
    }

    @GetMapping("/my-tickets")
    public ResponseEntity<Object> getMyTickets(HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ticketService.getEmployeeTickets(username, request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/start/{ticketCode}")
    public ResponseEntity<Object> startTicket(@PathVariable String ticketCode, HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ticketService.startProgress(ticketCode, username, request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/submit-check/{ticketCode}")
    public ResponseEntity<Object> submitToCheck(@PathVariable String ticketCode, @Valid @RequestBody TicketProgressDTO dto, HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ticketService.submitToCheck(ticketCode, dto, username, request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/approve/{ticketCode}")
    public ResponseEntity<Object> approveTicket(@PathVariable String ticketCode, @Valid @RequestBody TicketProgressDTO dto, HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ticketService.approveTicket(ticketCode, dto, username, request);
    }

    // UBAH: UUID ticketCode -> String ticketCode
    @PutMapping("/reject/{ticketCode}")
    public ResponseEntity<Object> rejectTicket(@PathVariable String ticketCode, @Valid @RequestBody TicketProgressDTO dto, HttpServletRequest request) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return ticketService.rejectTicket(ticketCode, dto, username, request);
    }
}