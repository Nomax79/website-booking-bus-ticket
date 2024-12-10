package obtbms.service.impl;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import obtbms.constant.MessageConstant;
import obtbms.entity.dto.LoginRequest;
import obtbms.entity.dto.LoginResponse;
import obtbms.entity.dto.RefreshTokenRequest;
import obtbms.enums.AccountStatus;
import obtbms.repository.UserRepository;
import obtbms.security.JwtService;
import obtbms.security.UserDetailsImpl;
import obtbms.security.UserDetailsServiceImpl;
import obtbms.service.AuthService;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.AnonymousAuthenticationFilter;
import org.springframework.security.web.authentication.logout.SecurityContextLogoutHandler;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserDetailsServiceImpl userDetailsService;
    private final UserRepository userRepository;

    @Override
    public LoginResponse login(LoginRequest loginRequest) {
        try {
            // Xác thực tài khoản và mật khẩu
            var authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword())
            );
            SecurityContextHolder.getContext().setAuthentication(authentication);

            // Lấy thông tin người dùng đã xác thực
            UserDetailsImpl userPrincipal = (UserDetailsImpl) authentication.getPrincipal();

            // Kiểm tra trạng thái tài khoản
            if (userPrincipal.getStatus().equals(AccountStatus.DISABLE)) {
                throw new DisabledException(MessageConstant.ACCOUNT_DISABLE);
            }

            // Tạo access token và refresh token
            String accessToken = jwtService.generateAccessToken(userPrincipal);
            String refreshToken = jwtService.generateRefreshToken(userPrincipal);

            return LoginResponse.builder()
                    .accessToken(accessToken)
                    .refreshToken(refreshToken)
                    .build();

        } catch (Exception e) {
            throw new BadCredentialsException("Invalid email or password!");
        }
    }

    @Override
    public boolean logout(HttpServletRequest request, HttpServletResponse response) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return false;
        }

        // Thực hiện logout
        new SecurityContextLogoutHandler().logout(request, response, auth);
        SecurityContextHolder.getContext().setAuthentication(null);  // Xóa thông tin authentication khỏi SecurityContext
        auth.setAuthenticated(false);  // Đánh dấu là không còn authenticated
        return true;
    }

    @Override
    public LoginResponse refreshToken(RefreshTokenRequest refreshTokenRequest) {
        String refreshToken = refreshTokenRequest.getRefreshToken();
        
        // Kiểm tra tính hợp lệ của refresh token
        if (!jwtService.validateToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token!");
        }

        // Lấy email từ refresh token
        String email = jwtService.getEmailFromToken(refreshToken);
        UserDetailsImpl userDetails = (UserDetailsImpl) userDetailsService.loadUserByUsername(email);

        // Tạo lại access token
        String accessToken = jwtService.generateAccessToken(userDetails);

        return LoginResponse.builder()
                .accessToken(accessToken)
                .build();
    }
    // Implement loginWithOAuth2 method
  @Override
  public LoginResponse loginWithOAuth2(String email) {
    // You can search for the user in your database by email
    // If the user doesn't exist, you might want to create a new user record
    var user = userRepository.findByEmail(email).orElseThrow(() -> new BadCredentialsException("User not found"));

    // Generate JWT tokens for the authenticated user
    UserDetailsImpl userDetails = new UserDetailsImpl(user);
    String accessToken = jwtService.generateAccessToken(userDetails);
    String refreshToken = jwtService.generateRefreshToken(userDetails);

    return LoginResponse.builder()
        .accessToken(accessToken)
        .refreshToken(refreshToken)
        .build();
  }
}
