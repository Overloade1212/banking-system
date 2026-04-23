package org.manage.bankserver.strategy;

import java.math.BigDecimal;

public class InvestmentPolicy implements AccountPolicy {

    @Override
    public void validateWithdrawal(BigDecimal balance, BigDecimal amount) {
        throw new IllegalArgumentException("Withdrawals are not allowed for INVESTMENT accounts");
    }
}