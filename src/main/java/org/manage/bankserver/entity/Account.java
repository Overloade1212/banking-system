package org.manage.bankserver.entity;



import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.manage.bankserver.entity.enums.AccountType;
import org.manage.bankserver.strategy.AccountPolicy;
import org.manage.bankserver.strategy.SavingsPolicy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "accounts")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String username;

    @Column(nullable = false)
    private BigDecimal balance;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AccountType type;


    @Column(name = "created_at")
    @CreationTimestamp
    private LocalDateTime createdAt;

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
