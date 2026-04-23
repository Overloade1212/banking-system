package org.manage.bankserver.strategy;

import java.math.BigDecimal;

public class CreditPolicy implements AccountPolicy {

    private static final BigDecimal CREDIT_LIMIT = new BigDecimal("-1000");

    @Override
    public void validateWithdrawal(BigDecimal balance, BigDecimal amount) {
        if (balance.subtract(amount).compareTo(CREDIT_LIMIT) < 0) {
            throw new IllegalArgumentException("Credit limit exceeded");
        }
    }
}