package com.chirag.ticketing_system.repository;

import com.chirag.ticketing_system.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepo extends JpaRepository<Comment,Integer> {

    List<Comment> findByTicketId(Integer ticketId);

    Comment findCommentById(Integer id);
}
