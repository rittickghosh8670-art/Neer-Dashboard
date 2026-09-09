package com.lbs.repository;

import com.lbs.model.BacktestSession;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BacktestSessionRepository extends JpaRepository<BacktestSession, Long> {
}
