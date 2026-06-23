package com.chirag.ticketing_system.repository;

import com.chirag.ticketing_system.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepo extends JpaRepository<User,Integer> {
}
