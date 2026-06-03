package com.juaracoding.ITHelpdeskTicketing.repository;

import com.juaracoding.ITHelpdeskTicketing.model.TicketTimeline;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketTimelineRepository extends JpaRepository<TicketTimeline, UUID> {
    // Menampilkan semua timeline berdasarkan satu tiket tertentu (diurutkan dari yang terbaru)
    List<TicketTimeline> findByTicket_IdOrderByCreatedAtDesc(UUID ticketId);
}