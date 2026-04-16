package org.manage.bankserver.strategy;

import java.math.BigDecimal;

public interface AccountPolicy {
     void validateWithdrawal(BigDecimal balance,BigDecimal amount);
}
