package com.chirag.ticketing_system.dto.ticketDto;

import com.chirag.ticketing_system.enums.Priority;
import com.chirag.ticketing_system.enums.Status;
import lombok.Data;

@Data
public class UpdateTicketRequest {

    private String description;
    private String title;
    private Priority priority;
    private Status status;
}
