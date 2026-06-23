package com.chirag.ticketing_system.service;

import com.chirag.ticketing_system.dto.commentDto.CommentResponse;
import com.chirag.ticketing_system.dto.commentDto.CreateCommentRequest;
import com.chirag.ticketing_system.entity.Comment;
import com.chirag.ticketing_system.entity.Ticket;
import com.chirag.ticketing_system.entity.User;
import com.chirag.ticketing_system.repository.CommentRepo;
import com.chirag.ticketing_system.repository.TicketRepo;
import com.chirag.ticketing_system.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CommentService {

    @Autowired
    private CommentRepo commentRepo;

    @Autowired
    private UserRepo userRepo;

    @Autowired
    private TicketRepo ticketRepo;

    public CommentResponse createNewComment(CreateCommentRequest createCommentRequest){

        Comment comment=new Comment();
        CommentResponse commentResponse=new CommentResponse();

        comment.setMessage(createCommentRequest.getMessage());

        User u1=userRepo.findById(createCommentRequest.getUserId()).orElseThrow(() -> new IllegalArgumentException("User not found cannot create comment"));
        comment.setUser(u1);

        Ticket ticket=ticketRepo.findTicketsById(createCommentRequest.getTicketId()).orElseThrow(() -> new IllegalArgumentException("Ticket not found cannot create comment"));
        comment.setTicket(ticket);

        commentResponse.setTicket_id(ticket.getId());
        commentResponse.setCreatedBy(u1.getName());
        commentResponse.setMessage(createCommentRequest.getMessage());

        commentRepo.save(comment);
        return commentResponse;
    }

    public List<CommentResponse> getAllCommentsByTicketId(Integer id){
        List<Comment> result=commentRepo.findByTicketId(id);

        List<CommentResponse> ans=new ArrayList<>();

        for(Comment c:result){
            CommentResponse cR=new CommentResponse();

            cR.setMessage(c.getMessage());
            cR.setCreatedAt(c.getCreatedAt());
            cR.setTicket_id(c.getTicket().getId());
            cR.setCreatedBy(c.getUser().getName());

            ans.add(cR);

        }
        return ans;
    }

    public String deleteCommentComp(Integer id){
        if(commentRepo.existsById(id)){
            commentRepo.deleteById(id);
            return "Comment Deleted Successfully";
        }
        return "Comment not found with provided id : "+id;
    }

    public CommentResponse findCommentDetails(Integer id){
        Comment comment=commentRepo.findCommentById(id);
        if (comment!=null){
            CommentResponse commentResponse=new CommentResponse();
            commentResponse.setCreatedAt(comment.getCreatedAt());
            commentResponse.setMessage(comment.getMessage());
            commentResponse.setTicket_id(comment.getTicket().getId());
            commentResponse.setCreatedBy(comment.getUser().getName());

            return commentResponse;
        }
        return null;
    }
}
