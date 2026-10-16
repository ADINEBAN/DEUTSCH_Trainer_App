package com.deutschtrainer.repo;

import com.deutschtrainer.domain.Phrase;
import com.deutschtrainer.dto.SituationCount;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.UUID;

public interface PhraseRepository extends JpaRepository<Phrase, UUID> {

    @Query("SELECT p FROM Phrase p WHERE (:situation IS NULL OR p.situation = :situation) "
            + "AND (:q IS NULL OR LOWER(p.german) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')) "
            + "OR LOWER(p.vietnamese) LIKE LOWER(CONCAT('%', CAST(:q AS string), '%')))")
    Page<Phrase> search(@Param("situation") String situation,
                       @Param("q") String q,
                       Pageable pageable);

    Page<Phrase> findBySituation(String situation, Pageable pageable);

    @Query("SELECT new com.deutschtrainer.dto.SituationCount(p.situation, COUNT(p)) "
            + "FROM Phrase p GROUP BY p.situation ORDER BY p.situation")
    List<SituationCount> countBySituation();
}
