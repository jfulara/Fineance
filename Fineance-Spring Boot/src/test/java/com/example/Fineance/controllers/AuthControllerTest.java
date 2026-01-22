package com.example.Fineance.controllers;

import com.example.Fineance.models.User;
import com.example.Fineance.services.AuthService;
import com.example.Fineance.services.JwtService;
import com.example.Fineance.services.TokenService;
import com.example.Fineance.repositories.UserRepository;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.test.web.servlet.MockMvc;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.user;

@WebMvcTest(AuthController.class)
@Import(AuthControllerTest.TestConfig.class)
class AuthControllerTest {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private AuthService authService;
    @Autowired
    private JwtService jwtService;

    @TestConfiguration
    static class TestConfig {
        @Bean
        public AuthService authService() {
            return Mockito.mock(AuthService.class);
        }

        @Bean
        public JwtService jwtService() {
            return Mockito.mock(JwtService.class);
        }

        @Bean
        public TokenService tokenService() {
            return Mockito.mock(TokenService.class);
        }

        @Bean
        public UserRepository userRepository() {
            return Mockito.mock(UserRepository.class);
        }

        @Bean
        public AuthenticationManager authenticationManager() {
            return Mockito.mock(AuthenticationManager.class);
        }

        @Bean
        public com.example.Fineance.security.JwtFilter jwtFilter() {
            return Mockito.mock(com.example.Fineance.security.JwtFilter.class);
        }
    }

    @Test
    void login_shouldReturnOk() throws Exception {
        User user = new User();
        user.setId_user(1L);
        user.setEmail("test@example.com");
        Mockito.when(authService.authenticate(Mockito.any())).thenReturn(user);
        Mockito.when(jwtService.generateAccessToken(Mockito.any())).thenReturn("access");
        Mockito.when(jwtService.generateRefreshToken(Mockito.any())).thenReturn("refresh");
        mockMvc.perform(post("/api/auth/login")
                .with(csrf())
                .with(user("test@example.com"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"password\":\"password\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void register_shouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/auth/register")
                .with(csrf())
                .with(user("test@example.com"))
                .contentType(MediaType.APPLICATION_JSON)
                .content("{\"email\":\"test@example.com\",\"password\":\"password\",\"name\":\"Test\",\"surname\":\"User\"}"))
                .andExpect(status().isOk());
    }

    @Test
    void logout_shouldReturnOk() throws Exception {
        mockMvc.perform(post("/api/auth/logout")
                .with(csrf())
                .with(user("test@example.com")))
                .andExpect(status().isOk());
    }
}

