package com.juaracoding.ITHelpdeskTicketing.repository;

import com.juaracoding.ITHelpdeskTicketing.model.Employee;
import com.juaracoding.ITHelpdeskTicketing.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface TicketRepo extends JpaRepository<Ticket, UUID> {

    // Pencarian tiket dengan String (karena bukan UUID lagi)
    Optional<Ticket> findByTicketCode(String ticketCode);

    List<Ticket> findByAssignedEmployee(Employee employee);

    // KUNCI UTAMA: Menghitung jumlah tiket pada rentang waktu hari ini
    long countByCreatedAtBetween(LocalDateTime startOfDay, LocalDateTime endOfDay);
}