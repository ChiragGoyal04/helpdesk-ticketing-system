package com.chirag.ticketing_system.controller;

import com.chirag.ticketing_system.dto.commentDto.CommentResponse;
import com.chirag.ticketing_system.dto.commentDto.CreateCommentRequest;
import com.chirag.ticketing_system.service.CommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.parameters.P;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/comment")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @PostMapping("/create")
    public ResponseEntity<?> createComment(@RequestBody CreateCommentRequest createCommentRequest){
        return ResponseEntity.ok().body(commentService.createNewComment(createCommentRequest));
    }

    @GetMapping("/ticket/{ticket_id}")
    public ResponseEntity<?> getAllCommentsByTicket(@PathVariable Integer ticket_id){
        return ResponseEntity.ok().body(commentService.getAllCommentsByTicketId(ticket_id));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable Integer id){
        return ResponseEntity.ok().body(commentService.deleteCommentComp(id));
    }

    @GetMapping("/get/{id}")
    public ResponseEntity<?> getComment(@PathVariable Integer id){

        CommentResponse res=commentService.findCommentDetails(id);
        if (res!=null){
            return ResponseEntity.ok().body(res);
        }
        return ResponseEntity.badRequest().body("Comment not found with provided id : "+id);
    }
}
