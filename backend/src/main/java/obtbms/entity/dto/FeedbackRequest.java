package obtbms.entity.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class FeedbackRequest {
  
  @NotBlank(message = "Họ và tên không được để trống")
  private String fullName;

  @NotBlank(message = "Email không được để trống")
  @Email(message = "Email không hợp lệ")
  private String email;

  private String phone;

  @NotBlank(message = "Tiêu đề không được để trống")
  private String title;

  @NotBlank(message = "Nội dung không được để trống")
  private String content;
}
