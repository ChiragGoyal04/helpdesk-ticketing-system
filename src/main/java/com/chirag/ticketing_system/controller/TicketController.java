package com.chirag.ticketing_system.controller;

import com.chirag.ticketing_system.dto.ticketDto.CreateTicketRequest;
import com.chirag.ticketing_system.dto.ticketDto.UpdateStatus;
import com.chirag.ticketing_system.dto.ticketDto.UpdateTicketRequest;
import com.chirag.ticketing_system.enums.Status;
import com.chirag.ticketing_system.repository.TicketRepo;
import com.chirag.ticketing_system.service.TicketService;
import org.hibernate.sql.Update;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tickets")
public class TicketController {

    @Autowired
    private TicketService ticketService;

    @Autowired
    private TicketRepo ticketRepo;

    @PostMapping("/create")
    public ResponseEntity<?> createTicket(@RequestBody CreateTicketRequest createTicketRequest){
        return ResponseEntity.ok().body(ticketService.createTicketReq(createTicketRequest));
    }

    @GetMapping("/all")
    public ResponseEntity<?> getAllTickets(){
        return ResponseEntity.ok().body(ticketService.fetchAllTickets());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicket(@PathVariable Integer id){
        return ResponseEntity.ok().body(ticketService.getTicketBId(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(@PathVariable Integer id, @RequestBody UpdateTicketRequest updateTicketRequest){
       return ResponseEntity.ok().body(ticketService.updateTicketing(id,updateTicketRequest));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable Integer id){
        if(ticketRepo.existsById(id)){
            ticketRepo.deleteById(id);
            return ResponseEntity.ok().body("Ticket is deleted successfully and the related content also deleted");
        }
        return ResponseEntity.badRequest().body("Ticket not found on the provided id : "+id);
    }

    @PatchMapping("/{id}/statusUpdate")
    public ResponseEntity<?> updateStatus(@PathVariable Integer id, @RequestBody UpdateStatus updateStatus){
       return ResponseEntity.ok().body(ticketService.updateTicketStat(id,updateStatus));
    }

    @PatchMapping("/{id}/assign/{agentId}")
    public ResponseEntity<?> updateAgent(@PathVariable Integer id,@PathVariable Integer agentId){
        return ResponseEntity.ok().body(ticketService.updateAgentOnTicket(id,agentId));
    }

    @GetMapping("/Status/{status}")
    public ResponseEntity<?> getTicketsBYStatus(@PathVariable String status){
        return ResponseEntity.ok().body(ticketService.getTicketsByStats(status));
    }

    @GetMapping("/Priority/{priority}")
    public ResponseEntity<?> getTicketsPriority(@PathVariable String priority){
        return ResponseEntity.ok().body(ticketService.getTicketsByPrior(priority));
    }
}
