package com.lbs.repository;

import com.lbs.model.MetricsCache;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface MetricsCacheRepository extends JpaRepository<MetricsCache, Long> {
    Optional<MetricsCache> findByScope(String scope);
}
