package obtbms.controller;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import obtbms.common.ResponseObject;
import obtbms.constant.MessageConstant;
import obtbms.entity.User;
import obtbms.entity.dto.LoginRequest;
import obtbms.entity.dto.LoginResponse;
import obtbms.entity.dto.RefreshTokenRequest;
import obtbms.enums.AccountStatus;
import obtbms.exception.ErrorCode;
import obtbms.exception.NotFoundException;
import obtbms.repository.UserRepository;
import obtbms.security.JwtService;
import obtbms.security.UserDetailsImpl;
import obtbms.service.AuthService;

import org.hibernate.mapping.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AccountStatusException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.InternalAuthenticationServiceException;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

import static obtbms.constant.ApiEndpoint.*;

@RestController
@RequestMapping(AUTH_ENDPOINT)
@RequiredArgsConstructor
public class AuthController {

  private final AuthService authService;
  private final UserRepository userRepository;
  private final JwtService jwtService;
  @PostMapping(AUTH_LOGIN)
  public ResponseEntity<ResponseObject<Object>> login(@RequestBody @Valid LoginRequest loginRequest) {
    try {
      return ResponseEntity.ok().body(ResponseObject.builder().isSuccess(true).message(MessageConstant.LOGIN_SUCCESS).data(authService.login(loginRequest)).build());
    } catch (InternalAuthenticationServiceException | DisabledException | BadCredentialsException e ) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseObject.builder().isSuccess(false).message(e.getMessage()).build());
    }
  }

  @PostMapping(AUTH_LOGOUT)
  public ResponseEntity<ResponseObject<Object>> logout(HttpServletRequest request, HttpServletResponse response) {
    if (authService.logout(request, response)) {
      return ResponseEntity.ok().body(ResponseObject.builder().isSuccess(true).message(MessageConstant.LOGOUT_SUCCESS).build());
    }
    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseObject.builder().isSuccess(false).build());
  }

  @PostMapping(AUTH_REFRESH_TOKEN)
  public ResponseEntity<ResponseObject<Object>> refreshToken(@RequestBody @Valid RefreshTokenRequest refreshTokenRequest) {
    try {
      return ResponseEntity.ok().body(ResponseObject.builder().isSuccess(true).data(authService.refreshToken(refreshTokenRequest)).build());
    } catch (Exception e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ResponseObject.builder().isSuccess(false).message(MessageConstant.REFRESH_TOKEN_FAIL).build());
    }
  }
  @PostMapping("/api/auth/login")
  public ResponseEntity<ResponseObject<Object>> loginWithGoogle(OAuth2AuthenticationToken authentication) {
    String email = authentication.getPrincipal().getName(); // Extract email from OAuth2 token
    LoginResponse loginResponse = authService.loginWithOAuth2(email);

    return ResponseEntity.ok().body(
        ResponseObject.builder()
            .isSuccess(true)
            .message(MessageConstant.LOGIN_SUCCESS)
            .data(loginResponse)
            .build()
    );
  }
}
