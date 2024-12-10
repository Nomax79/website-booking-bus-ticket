package obtbms.repository;

import obtbms.entity.User;
import obtbms.enums.AccountStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
  
  // Tìm người dùng theo số điện thoại
  Optional<User> findUserByPhone(String phone);

  // Tìm tất cả người dùng theo trạng thái
  List<User> findAllByStatus(AccountStatus status);

  // Đếm tổng số người dùng có trạng thái là 1 (ACTIVE)
  @Query("SELECT COUNT(u) FROM User u WHERE u.status = 1")
  int countTotalUsers();
  
  // Thêm phương thức tìm người dùng theo email
  Optional<User> findByEmail(String email);
}
