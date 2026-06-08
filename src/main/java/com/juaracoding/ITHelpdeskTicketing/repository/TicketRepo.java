package com.juaracoding.ITHelpdeskTicketing.repository;

import com.juaracoding.ITHelpdeskTicketing.model.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface TicketRepo extends JpaRepository<Ticket, UUID> {
    // Mencari tiket berdasarkan status (Open, OnProgress, dll)
    List<Ticket> findByStatus(String status);

    // Mencari tiket yang ditugaskan ke karyawan tertentu
    List<Ticket> findByAssignedEmployee_Id(UUID employeeId);
}