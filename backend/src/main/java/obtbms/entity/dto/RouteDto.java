package obtbms.entity.dto;

import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.annotation.Nullable;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class RouteDto {
  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY) // Hoặc GenerationType.AUTO
  private int routeId;
  private int originId;
  private int destinationId;
  @NotBlank
  private String journeyDuration;
  @NotBlank
  private String routeLength;
  private float price;
}
