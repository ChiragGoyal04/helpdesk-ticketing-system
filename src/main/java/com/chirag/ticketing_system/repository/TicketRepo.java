package com.chirag.ticketing_system.repository;

import com.chirag.ticketing_system.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TicketRepo extends JpaRepository<Ticket,Integer> {
    Optional<Ticket> findTicketsById(Integer id);

    Ticket getTicketById(Integer id);

    List<Ticket> getTicketByStatus(String status);

    List<Ticket> getTicketByPriority(String priority);
}
