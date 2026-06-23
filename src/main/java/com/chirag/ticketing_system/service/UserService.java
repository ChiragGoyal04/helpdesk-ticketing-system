package com.chirag.ticketing_system.service;

import com.chirag.ticketing_system.dto.userDto.RegisterUserRequest;
import com.chirag.ticketing_system.dto.userDto.UserResponse;
import com.chirag.ticketing_system.entity.User;
import com.chirag.ticketing_system.repository.UserRepo;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class UserService {

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private UserRepo userRepo;

    public String createNewUser(RegisterUserRequest registerUserRequest){
        User user=new User();
        user.setName(registerUserRequest.getName());
        user.setPassword(passwordEncoder.encode(registerUserRequest.getPassword()));
        user.setEmail(registerUserRequest.getEmail());
        user.setRole(registerUserRequest.getRole());

        userRepo.save(user);
        return "User Saved Successfully";
    }

    public List<UserResponse> fetchAllUsers(){
        List<User> users=userRepo.findAll();
        List<UserResponse> responses=new ArrayList<>();
        for (User u:users){
            UserResponse userResponse=new UserResponse();
            userResponse.setEmail(u.getEmail());
            userResponse.setName(u.getName());
            userResponse.setRole(u.getRole());
            responses.add(userResponse);
        }
        return responses;
    }

    public UserResponse fetchUser(Integer id){
        User u=userRepo.findById(id).orElseThrow(() -> new IllegalArgumentException("User not Found with provided id"));
        if (u!=null){
            UserResponse userResponse=new UserResponse();
            userResponse.setName(u.getName());
            userResponse.setEmail(u.getEmail());
            userResponse.setRole(u.getRole());
            return userResponse;
        }
        return null;
    }
}
