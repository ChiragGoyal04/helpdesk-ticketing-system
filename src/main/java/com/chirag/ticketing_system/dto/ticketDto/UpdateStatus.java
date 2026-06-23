package com.chirag.ticketing_system.dto.ticketDto;

import com.chirag.ticketing_system.enums.Status;
import lombok.Data;

@Data
public class UpdateStatus {

    private Status status;
}
