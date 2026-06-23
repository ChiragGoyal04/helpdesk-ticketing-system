package com.chirag.ticketing_system.controller;

import com.chirag.ticketing_system.dto.userDto.RegisterUserRequest;
import com.chirag.ticketing_system.dto.userDto.UserResponse;
import com.chirag.ticketing_system.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/user")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/create")
    public ResponseEntity<?> createUser(@RequestBody RegisterUserRequest registerUserRequest){
        return ResponseEntity.ok().body(userService.createNewUser(registerUserRequest));
    }

    @GetMapping("/all")
    private ResponseEntity<List<UserResponse>> getAllUsers(){
        return ResponseEntity.ok().body(userService.fetchAllUsers());
    }

    @GetMapping("/get/{id}")
    private ResponseEntity<?> getUser(@PathVariable Integer id){
        UserResponse userResponse=userService.fetchUser(id);
        if (userResponse!=null){
            return ResponseEntity.ok().body(userResponse);
        }
        return ResponseEntity.badRequest().body("User not found with the provided id : "+id);
    }
}
