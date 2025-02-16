  package obtbms.repository;

  import obtbms.entity.Bus;
  import org.springframework.data.jpa.repository.JpaRepository;
  import org.springframework.data.jpa.repository.Query;
  import org.springframework.stereotype.Repository;

  import java.util.List;

  @Repository
  public interface BusRepository extends JpaRepository<Bus, Integer> {

    @Query("select b from Bus b")
    List<Bus> findBusUnused();

  }
