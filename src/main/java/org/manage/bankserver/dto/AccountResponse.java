package org.manage.bankserver.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class AccountResponse {

    private UUID id;
    private String username;
    private BigDecimal balance;
    private String type;
    private LocalDateTime createdAt;
}