package com.juaracoding.ITHelpdeskTicketing.service;

import com.juaracoding.ITHelpdeskTicketing.dto.response.TicketResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.response.TicketsResponseDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.CreateTicketDTO;
import com.juaracoding.ITHelpdeskTicketing.dto.validation.TicketProgressDTO;
import com.juaracoding.ITHelpdeskTicketing.handler.ResponseHandler;
import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Evidence;
import com.juaracoding.ITHelpdeskTicketing.model.Ticket;
import com.juaracoding.ITHelpdeskTicketing.model.TicketLog;
import com.juaracoding.ITHelpdeskTicketing.repository.EmployeeRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.EvidenceRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.TicketLogRepo;
import com.juaracoding.ITHelpdeskTicketing.repository.TicketRepo;
import com.juaracoding.ITHelpdeskTicketing.util.ConstantMessage;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.transaction.Transactional;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;

@Service
public class TicketService {

    @Autowired
    private TicketRepo ticketRepo;

    @Autowired
    private TicketLogRepo ticketLogRepo;

    @Autowired
    private EvidenceRepo evidenceRepo;

    @Autowired
    private EmployeeRepo employeeRepo;

    @Autowired
    ModelMapper modelMapper;

    @Autowired
    private CloudinaryService cloudinaryService;

    // =========================================================================
    // HELPER METHOD: GENERATOR TICKET CODE (Format: IT-DDMMYY-01)
    // =========================================================================
    private String generateTicketCode() {
        LocalDate today = LocalDate.now();
        String datePart = today.format(DateTimeFormatter.ofPattern("ddMMyy"));

        LocalDateTime startOfDay = today.atStartOfDay();
        LocalDateTime endOfDay = today.atTime(23, 59, 59);

        long countToday = ticketRepo.countByCreatedAtBetween(startOfDay, endOfDay);
        long nextSequence = countToday + 1;

        String sequencePart = String.format("%02d", nextSequence); // format jadi 01, 02, dst

        return "IT-" + datePart + "-" + sequencePart;
    }
    // =========================================================================

    public ResponseEntity<Object> getTickets(HttpServletRequest request){

        List<Ticket> tickets = ticketRepo.findAll();
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);

        List<TicketsResponseDTO> dtoList = tickets.stream().map(ticket -> {
            TicketsResponseDTO dto = new TicketsResponseDTO();

            dto.setTicketCode(ticket.getTicketCode());
            dto.setTicketName(ticket.getTicketName());
            dto.setStatus(ticket.getStatus());
            dto.setDeadline(ticket.getDeadline().format(formatter));
            dto.setAssignedEmployeeName(ticket.getAssignedEmployee().getEmployeeName());

            // Safety check in case createdAt is somehow null
            if (ticket.getCreatedAt() != null) {
                dto.setCreatedAt(ticket.getCreatedAt().format(formatter));
            } else {
                dto.setCreatedAt("-");
            }

            return dto;
        }).toList();

        return new ResponseHandler()
                .handleResponse(ConstantMessage.OK, HttpStatus.OK, dtoList, request);
    }

    public ResponseEntity<Object> getTicket(String ticketCode, HttpServletRequest request){

        Ticket ticket = ticketRepo.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Tiket tidak ditemukan"));

        TicketResponseDTO dto = new TicketResponseDTO();
        dto.setId(ticket.getId().toString());
        dto.setTicketCode(ticket.getTicketCode());
        dto.setTicketName(ticket.getTicketName());
        dto.setTicketDesc(ticket.getTicketDesc());
        dto.setStatus(ticket.getStatus());

        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("d MMMM yyyy", Locale.ENGLISH);
        dto.setDeadline(ticket.getDeadline().format(formatter));
        dto.setCreatedAt(ticket.getCreatedAt() != null ? ticket.getCreatedAt().format(formatter) : "-");
        dto.setAssignedEmployeeName(ticket.getAssignedEmployee().getEmployeeName());

        List<String> evidenceLinks = ticket.getEvidences().stream()
                .map(Evidence::getEvidenceLink)
                .toList();
        dto.setEvidences(evidenceLinks);

        // Parse timelines/logs
        LocalDateTime assignedAt = ticket.getCreatedAt();
        LocalDateTime takenAt = null;
        LocalDateTime checkedAt = null;
        LocalDateTime completedAt = null;
        int reopenCount = 0;

        // Loop the timeline to map timestamps
        if (ticket.getTimelines() != null) {
            for (TicketLog log : ticket.getTimelines()) {
                String logStatus = log.getStatus();
                if ("Open".equalsIgnoreCase(logStatus)) {
                    assignedAt = log.getCreatedAt();
                } else if ("On Progress".equalsIgnoreCase(logStatus) || "In Progress".equalsIgnoreCase(logStatus)) {
                    if (takenAt == null) {
                        takenAt = log.getCreatedAt();
                    }
                } else if ("On Check".equalsIgnoreCase(logStatus)) {
                    checkedAt = log.getCreatedAt();
                } else if ("Complete".equalsIgnoreCase(logStatus) || "Completed".equalsIgnoreCase(logStatus)) {
                    completedAt = log.getCreatedAt();
                } else if ("Reopen".equalsIgnoreCase(logStatus)) {
                    reopenCount++;
                }
            }
        }

        dto.setAssignedAt(assignedAt != null ? assignedAt.toString() : null);
        dto.setTakenAt(takenAt != null ? takenAt.toString() : null);
        dto.setCheckedAt(checkedAt != null ? checkedAt.toString() : null);
        dto.setCompletedAt(completedAt != null ? completedAt.toString() : null);
        dto.setReopenCount(reopenCount);

        return new ResponseHandler()
                .handleResponse(ConstantMessage.OK, HttpStatus.OK, dto, request);
    }

    @Transactional
    public ResponseEntity<Object> createTicket(CreateTicketDTO dto, List<MultipartFile> files, String username, HttpServletRequest request) {

        Employee creatorLead = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User LEAD tidak ditemukan"));

        Employee assignedEmployee = employeeRepo.findByUserName(dto.getAssignedEmployeeId())
                .orElseThrow(() -> new RuntimeException("Employee yang ditugaskan tidak ditemukan di database"));

        LocalDateTime deadlineParsed = LocalDateTime.parse(
                dto.getDeadline() + " 23:59",
                DateTimeFormatter.ofPattern("d MMMM yyyy HH:mm", new Locale("id", "ID"))
        );

        Ticket ticket = new Ticket();
        ticket.setTicketCode(generateTicketCode());
        ticket.setTicketName(dto.getTicketName());
        ticket.setTicketDesc(dto.getTicketDesc());
        ticket.setDeadline(deadlineParsed);
        ticket.setStatus("Open");
        ticket.setCreatedBy(creatorLead.getUserName());
        ticket.setAssignedEmployee(assignedEmployee);
        ticket.setCreatedAt(LocalDateTime.now()); // FIX: Secara eksplisit set waktu tiket dibuat

        Ticket savedTicket = ticketRepo.save(ticket);

        TicketLog log = new TicketLog();
        log.setTicket(savedTicket);
        log.setEmployee(creatorLead);
        log.setStatus("Open");
        log.setExtraNote("Tiket dibuat oleh LEAD (" + creatorLead.getEmployeeName() +
                ") dan ditugaskan ke EMPLOYEE (" + assignedEmployee.getEmployeeName() + ")");
        log.setCreatedBy(creatorLead.getUserName());
        log.setCreatedAt(LocalDateTime.now()); // FIX: Secara eksplisit set waktu log dibuat
        ticketLogRepo.save(log);

        if (files != null && !files.isEmpty()) {
            for (MultipartFile file : files) {
                String urlCloudinary = cloudinaryService.uploadFile(file);

                Evidence evidence = new Evidence();
                evidence.setTicket(savedTicket);
                evidence.setEvidenceLink(urlCloudinary);
                evidence.setCreatedBy(creatorLead.getUserName());
                evidence.setCreatedAt(LocalDateTime.now()); // FIX: Opsional, set waktu evidence
                evidenceRepo.save(evidence);
            }
        }

        String pesanSukses = "Berhasil membuat tiket. Tiket ditugaskan ke: " + assignedEmployee.getEmployeeName();
        return new ResponseHandler()
                .handleResponse(pesanSukses, HttpStatus.CREATED, savedTicket, request);
    }

    public ResponseEntity<Object> getEmployeeTickets(String username, HttpServletRequest request) {
        Employee employee = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("Data Employee tidak ditemukan"));

        List<Ticket> tickets = ticketRepo.findByAssignedEmployee(employee);
        return new ResponseHandler().handleResponse("Berhasil mengambil daftar tiket Anda", HttpStatus.OK, tickets, request);
    }

    @Transactional
    public ResponseEntity<Object> startProgress(String ticketCode, String username, HttpServletRequest request) {
        Ticket ticket = ticketRepo.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Tiket tidak ditemukan"));
        Employee employee = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("Employee tidak ditemukan"));

        if (!ticket.getAssignedEmployee().getId().equals(employee.getId())) {
            return new ResponseHandler().handleResponse("Ini bukan tiket tugas Anda!", HttpStatus.FORBIDDEN, null, request);
        }
        if (!ticket.getStatus().equalsIgnoreCase("Open") && !ticket.getStatus().equalsIgnoreCase("Reopen")) {
            return new ResponseHandler().handleResponse("Tiket harus berstatus Open atau Reopen!", HttpStatus.BAD_REQUEST, null, request);
        }

        ticket.setStatus("On Progress");
        ticket.setUpdatedBy(employee.getUserName());
        ticketRepo.save(ticket);

        TicketLog log = new TicketLog();
        log.setTicket(ticket);
        log.setEmployee(employee);
        log.setStatus("On Progress");
        log.setExtraNote("EMPLOYEE (" + employee.getEmployeeName() + ") mulai mengerjakan tiket.");
        log.setCreatedBy(employee.getUserName());
        log.setCreatedAt(LocalDateTime.now()); // FIX: Secara eksplisit set waktu
        ticketLogRepo.save(log);

        return new ResponseHandler().handleResponse("Tiket On Progress", HttpStatus.OK, null, request);
    }

    @Transactional
    public ResponseEntity<Object> submitToCheck(String ticketCode, TicketProgressDTO dto, String username, HttpServletRequest request) {
        Ticket ticket = ticketRepo.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Tiket tidak ditemukan"));
        Employee employee = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("Employee tidak ditemukan"));

        if (!ticket.getAssignedEmployee().getId().equals(employee.getId())) {
            return new ResponseHandler().handleResponse("Ini bukan tiket tugas Anda!", HttpStatus.FORBIDDEN, null, request);
        }
        if (!ticket.getStatus().equalsIgnoreCase("On Progress")) {
            return new ResponseHandler().handleResponse("Tiket harus berstatus On Progress!", HttpStatus.BAD_REQUEST, null, request);
        }

        ticket.setStatus("On Check");
        ticket.setUpdatedBy(employee.getUserName());
        ticketRepo.save(ticket);

        TicketLog log = new TicketLog();
        log.setTicket(ticket);
        log.setEmployee(employee);
        log.setStatus("On Check");
        log.setExtraNote("EMPLOYEE mengklaim selesai: " + dto.getExtraNote());
        log.setCreatedBy(employee.getUserName());
        log.setCreatedAt(LocalDateTime.now()); // FIX: Secara eksplisit set waktu
        ticketLogRepo.save(log);

        return new ResponseHandler().handleResponse("Tiket diajukan ke LEAD (On Check)", HttpStatus.OK, null, request);
    }

    @Transactional
    public ResponseEntity<Object> approveTicket(String ticketCode, TicketProgressDTO dto, String username, HttpServletRequest request) {
        Ticket ticket = ticketRepo.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Tiket tidak ditemukan"));
        Employee lead = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User LEAD tidak ditemukan"));

        if (!ticket.getStatus().equalsIgnoreCase("On Check")) {
            return new ResponseHandler().handleResponse("Tiket belum diajukan selesai oleh Employee!", HttpStatus.BAD_REQUEST, null, request);
        }

        ticket.setStatus("Complete");
        ticket.setUpdatedBy(lead.getUserName());
        ticketRepo.save(ticket);

        TicketLog log = new TicketLog();
        log.setTicket(ticket);
        log.setEmployee(lead);
        log.setStatus("Complete");
        log.setExtraNote("LEAD menyetujui penutupan tiket: " + dto.getExtraNote());
        log.setCreatedBy(lead.getUserName());
        log.setCreatedAt(LocalDateTime.now()); // FIX: Secara eksplisit set waktu
        ticketLogRepo.save(log);

        return new ResponseHandler().handleResponse("Tiket diselesaikan (Complete)", HttpStatus.OK, null, request);
    }

    @Transactional
    public ResponseEntity<Object> rejectTicket(String ticketCode, TicketProgressDTO dto, String username, HttpServletRequest request) {
        Ticket ticket = ticketRepo.findByTicketCode(ticketCode)
                .orElseThrow(() -> new RuntimeException("Tiket tidak ditemukan"));
        Employee lead = employeeRepo.findByUserName(username)
                .orElseThrow(() -> new RuntimeException("User LEAD tidak ditemukan"));

        if (!ticket.getStatus().equalsIgnoreCase("On Check")) {
            return new ResponseHandler().handleResponse("Tiket belum diajukan selesai oleh Employee!", HttpStatus.BAD_REQUEST, null, request);
        }

        ticket.setStatus("Reopen");
        ticket.setUpdatedBy(lead.getUserName());
        ticketRepo.save(ticket);

        TicketLog log = new TicketLog();
        log.setTicket(ticket);
        log.setEmployee(lead);
        log.setStatus("Reopen");
        log.setExtraNote("LEAD menolak tiket. Alasan: " + dto.getExtraNote());
        log.setCreatedBy(lead.getUserName());
        log.setCreatedAt(LocalDateTime.now()); // FIX: Secara eksplisit set waktu
        ticketLogRepo.save(log);

        return new ResponseHandler().handleResponse("Tiket dikembalikan ke EMPLOYEE (Reopen)", HttpStatus.OK, null, request);
    }
}