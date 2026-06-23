package com.chirag.ticketing_system.service;

import com.chirag.ticketing_system.dto.ticketDto.CreateTicketRequest;
import com.chirag.ticketing_system.dto.ticketDto.TicketResponse;
import com.chirag.ticketing_system.dto.ticketDto.UpdateStatus;
import com.chirag.ticketing_system.dto.ticketDto.UpdateTicketRequest;
import com.chirag.ticketing_system.entity.Ticket;
import com.chirag.ticketing_system.entity.User;
import com.chirag.ticketing_system.repository.TicketRepo;
import com.chirag.ticketing_system.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.lang.reflect.Array;
import java.util.ArrayList;
import java.util.List;

@Service
public class TicketService {

    @Autowired
    private TicketRepo ticketRepo;

    @Autowired
    private UserRepo userRepo;


    //TICKET CREATION
    public TicketResponse createTicketReq(CreateTicketRequest createTicketRequest){
        TicketResponse ticketResponse=new TicketResponse();


        Ticket ticket=new Ticket();
        ticket.setTitle(createTicketRequest.getTitle());
        ticket.setDescription(createTicketRequest.getDescription());
        ticket.setStatus(createTicketRequest.getStatus());
        ticket.setPriority(createTicketRequest.getPriority());

        Integer create_id=createTicketRequest.getCreatedById();
        Integer assign_id=createTicketRequest.getAssignedAgentId();

        User u=userRepo.findById(create_id).orElseThrow(() -> new RuntimeException("User not found"));
        if(u!=null){
            ticket.setCreatedBy(u);
        }
        User u2=userRepo.findById(assign_id).orElseThrow(() -> new RuntimeException("Agent not found"));
        if(u!=null){
            ticket.setAssignedAgent(u2);
        }
        ticketRepo.save(ticket);

        ticketResponse.setStatus(ticket.getStatus());
        ticketResponse.setTitle(ticket.getTitle());
        ticketResponse.setDescription(ticket.getDescription());
        ticketResponse.setPriority(ticket.getPriority());
        ticketResponse.setCreatedBy(u.getName());
        ticketResponse.setAgentName(u2.getName());

        return ticketResponse;
    }

    //GETTING ALL TICKETS
    public List<TicketResponse> fetchAllTickets() {
        List<Ticket> tickets = ticketRepo.findAll();
        List<TicketResponse> result = new ArrayList<>();
        for (Ticket ticket : tickets) {
            TicketResponse ticketResponse = new TicketResponse();
            ticketResponse.setTitle(ticket.getTitle());
            ticketResponse.setDescription(ticket.getDescription());
            ticketResponse.setPriority(ticket.getPriority());
            ticketResponse.setStatus(ticket.getStatus());

            User u1 = ticket.getCreatedBy();
            User u2 = ticket.getAssignedAgent();

            ticketResponse.setCreatedBy(u1.getName());
            ticketResponse.setAgentName(u2.getName());

            result.add(ticketResponse);
        }
        return result;
    }

    //GET TICKET BY ID
    public TicketResponse getTicketBId(Integer id){
        Ticket ticket=ticketRepo.findTicketsById(id).orElseThrow(() -> new IllegalArgumentException("Ticket not found on the provided id"));
        TicketResponse ticketResponse = new TicketResponse();
        ticketResponse.setTitle(ticket.getTitle());
        ticketResponse.setDescription(ticket.getDescription());
        ticketResponse.setPriority(ticket.getPriority());
        ticketResponse.setStatus(ticket.getStatus());

        User u1 = ticket.getCreatedBy();
        User u2 = ticket.getAssignedAgent();

        ticketResponse.setCreatedBy(u1.getName());
        ticketResponse.setAgentName(u2.getName());

        return ticketResponse;

    }

    //update ticket by id
    public TicketResponse updateTicketing(Integer id, UpdateTicketRequest updateTicketRequest){
        Ticket ticket=ticketRepo.findTicketsById(id).orElseThrow(() -> new IllegalArgumentException("Ticket not found on the provided id"));
        if(ticket!=null){
            if(!updateTicketRequest.getDescription().isEmpty())
                ticket.setDescription(updateTicketRequest.getDescription());
            if(!updateTicketRequest.getTitle().isEmpty())
                ticket.setTitle(updateTicketRequest.getTitle());
            if(updateTicketRequest.getPriority()!=null)
                ticket.setPriority(updateTicketRequest.getPriority());
            if(updateTicketRequest.getStatus()!=null)
                ticket.setStatus(updateTicketRequest.getStatus());
            }

        TicketResponse ticketResponse=new TicketResponse();
        ticketResponse.setTitle(ticket.getTitle());
        ticketResponse.setDescription(ticket.getDescription());
        ticketResponse.setPriority(ticket.getPriority());
        ticketResponse.setStatus(ticket.getStatus());

        ticketRepo.save(ticket);


        String createdBy=ticket.getCreatedBy().getName();
//        System.out.println(createdBy);
        String assignedAgent=ticket.getAssignedAgent().getName();
//        System.out.println(assignedAgent);
        if(createdBy!=null){
            ticketResponse.setCreatedBy(createdBy);
        }
        if(assignedAgent!=null){
            ticketResponse.setAgentName(assignedAgent);
        }
        return ticketResponse;
        }

        //Update STATUS of Ticket
        public TicketResponse updateTicketStat(Integer id, UpdateStatus updateStatus){
            Ticket ticket=ticketRepo.findTicketsById(id).orElseThrow(() -> new IllegalArgumentException("Ticket not found on id"));

            ticket.setStatus(updateStatus.getStatus());

            TicketResponse ticketResponse=new TicketResponse();

            ticketResponse.setStatus(ticket.getStatus());
            ticketResponse.setTitle(ticket.getTitle());
            ticketResponse.setDescription(ticket.getDescription());
            ticketResponse.setPriority(ticket.getPriority());
            ticketResponse.setCreatedBy(ticket.getCreatedBy().getName());
            ticketResponse.setAgentName(ticket.getAssignedAgent().getName());

            return ticketResponse;

        }

        //Update Agent on Ticket
        public TicketResponse updateAgentOnTicket(Integer id,Integer agentId){
            Ticket ticket=ticketRepo.getTicketById(id);

            User u=userRepo.findById(agentId).orElseThrow(() -> new IllegalArgumentException("Agent not found"));
            ticket.setAssignedAgent(u);

            ticketRepo.save(ticket);

            TicketResponse ticketResponse=new TicketResponse();
            ticketResponse.setStatus(ticket.getStatus());
            ticketResponse.setTitle(ticket.getTitle());
            ticketResponse.setDescription(ticket.getDescription());
            ticketResponse.setPriority(ticket.getPriority());
            ticketResponse.setCreatedBy(ticket.getCreatedBy().getName());
            ticketResponse.setAgentName(ticket.getAssignedAgent().getName());

            return ticketResponse;
        }

        public List<TicketResponse> getTicketsByStats(String status){
            status=status.toUpperCase();
            List<Ticket> result=ticketRepo.getTicketByStatus(status);

            List<TicketResponse> ans=new ArrayList<>();
            for (Ticket ticket:result){
                TicketResponse ticketResponse=new TicketResponse();
                ticketResponse.setStatus(ticket.getStatus());
                ticketResponse.setTitle(ticket.getTitle());
                ticketResponse.setDescription(ticket.getDescription());
                ticketResponse.setPriority(ticket.getPriority());
                ticketResponse.setCreatedBy(ticket.getCreatedBy().getName());
                ticketResponse.setAgentName(ticket.getAssignedAgent().getName());

                ans.add(ticketResponse);
            }
            return ans;
        }

    public List<TicketResponse> getTicketsByPrior(String priority){
        priority=priority.toUpperCase();
        List<Ticket> result=ticketRepo.getTicketByPriority(priority);

        List<TicketResponse> ans=new ArrayList<>();
        for (Ticket ticket:result){
            TicketResponse ticketResponse=new TicketResponse();
            ticketResponse.setStatus(ticket.getStatus());
            ticketResponse.setTitle(ticket.getTitle());
            ticketResponse.setDescription(ticket.getDescription());
            ticketResponse.setPriority(ticket.getPriority());
            ticketResponse.setCreatedBy(ticket.getCreatedBy().getName());
            ticketResponse.setAgentName(ticket.getAssignedAgent().getName());

            ans.add(ticketResponse);
        }
        return ans;
    }
    }
