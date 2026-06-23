package com.chirag.ticketing_system.dto.commentDto;

import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Data
public class CommentResponse {

    private String message;

    @CreationTimestamp
    private LocalDateTime createdAt;

    private String createdBy;

    private Integer ticket_id;
}
