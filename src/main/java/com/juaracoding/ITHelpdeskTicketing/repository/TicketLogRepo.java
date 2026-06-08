package com.juaracoding.ITHelpdeskTicketing.repository;

import com.juaracoding.ITHelpdeskTicketing.model.TicketLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketLogRepo extends JpaRepository<TicketLog, UUID> {
    // Menampilkan semua timeline berdasarkan satu tiket tertentu (diurutkan dari yang terbaru)
    List<TicketLog> findByTicket_IdOrderByCreatedAtDesc(UUID ticketId);
}