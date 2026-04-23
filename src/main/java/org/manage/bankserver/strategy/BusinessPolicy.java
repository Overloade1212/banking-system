package org.manage.bankserver.strategy;

import java.math.BigDecimal;

public class BusinessPolicy implements AccountPolicy {

    @Override
    public void validateWithdrawal(BigDecimal balance, BigDecimal amount) {

        if (balance == null || amount == null) {
            throw new IllegalArgumentException("Invalid amount or balance");
        }

        if (balance.subtract(amount).compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalArgumentException("Insufficient funds for BUSINESS account");
        }
    }
}