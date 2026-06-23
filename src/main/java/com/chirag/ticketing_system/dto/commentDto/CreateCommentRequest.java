package com.chirag.ticketing_system.dto.commentDto;

import lombok.Data;

@Data
public class CreateCommentRequest {

    private String message;
    private Integer userId;
    private Integer ticketId;
}
