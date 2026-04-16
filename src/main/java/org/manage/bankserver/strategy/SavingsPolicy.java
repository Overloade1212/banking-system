package org.manage.bankserver.strategy;

import java.math.BigDecimal;

public class SavingsPolicy implements AccountPolicy{
    @Override
    public void validateWithdrawal(BigDecimal balance, BigDecimal amount) {
        if(balance.subtract(amount).compareTo(BigDecimal.ZERO)<0){
            throw new IllegalArgumentException("Insufficient funds for SAVINGS account");
        }
    }
}
