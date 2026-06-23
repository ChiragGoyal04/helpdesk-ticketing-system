package com.chirag.ticketing_system.entity;

import com.chirag.ticketing_system.enums.Role;
import jakarta.persistence.*;
import lombok.Data;

import java.util.List;
import lombok.*;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private String name;
    private String password;

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role role;

    @OneToMany(mappedBy = "createdBy",cascade = CascadeType.ALL)
    private List<Ticket> user_ticket_list;

    @OneToMany(mappedBy = "assignedAgent",cascade = CascadeType.ALL)
    private List<Ticket> agentList;

    @OneToMany(mappedBy = "user",cascade = CascadeType.ALL)
    private List<Comment> comments;
}
