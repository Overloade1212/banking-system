package org.manage.bankserver.model;



import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.manage.bankserver.strategy.AccountPolicy;
import org.manage.bankserver.strategy.SavingsPolicy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@NoArgsConstructor
public class Account {

    @Id
    
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private BigDecimal balance;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;

    @Transient
    private AccountPolicy policy;

    public void withdraw(BigDecimal amount) {
        if (policy == null) {
            reinitializePolicy();
        }

        if (policy == null) {
            throw new IllegalStateException("Account policy not initialized");
        }

        if (balance == null) {
            throw new IllegalStateException("Balance not initialized");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Withdrawal amount must be positive");
        }

        policy.validateWithdrawal(this.balance, amount);
        this.balance = this.balance.subtract(amount);
    }

    public void deposit(BigDecimal amount) {
        if (balance == null) {
            throw new IllegalStateException("Balance not initialized");
        }

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Deposit amount must be positive");
        }

        this.balance = this.balance.add(amount);
    }

    @PostLoad
    protected void reinitializePolicy() {
        if (this.type == null) return;

        switch (this.type) {
            case SAVINGS -> this.policy = new SavingsPolicy();
            default -> throw new IllegalStateException("Unknown account type: " + type);
        }
    }
}
