package com.example.Fineance.services;

import com.example.Fineance.models.Token;
import com.example.Fineance.models.User;
import com.example.Fineance.repositories.TokenRepository;
import com.example.Fineance.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Service
public class TokenService {
    private final TokenRepository tokenRepository;

    private final UserRepository userRepository;

    @Autowired
    public TokenService(TokenRepository tokenRepository, UserRepository userRepository) {
        this.tokenRepository = tokenRepository;
        this.userRepository = userRepository;
    }

    public void deleteTokenByUserEmail(String email) {
        Optional<User> userOpt = userRepository.findByEmail(email);
        userOpt.ifPresent(tokenRepository::deleteByUser);
    }

    @Transactional
    public void deleteTokenByValue(String tokenValue) {
        tokenRepository.deleteByToken(tokenValue);
    }

    public void saveToken(String tokenValue, User user) {
        var token = new Token();
        token.setToken(tokenValue);
        token.setUser(user);
        token.setRevoked(false);
        token.setExpired(false);
        tokenRepository.save(token);
    }
}
