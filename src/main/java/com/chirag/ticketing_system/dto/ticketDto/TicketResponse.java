package com.chirag.ticketing_system.dto.ticketDto;

import com.chirag.ticketing_system.enums.Priority;
import com.chirag.ticketing_system.enums.Status;
import lombok.Data;

@Data
public class TicketResponse {

    private String title;
    private String description;
    private Status status;
    private Priority priority;
    private String createdBy;
    private String agentName;
}
