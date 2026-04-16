package org.manage.bankserver.factory;



import org.manage.bankserver.model.Account;
import org.manage.bankserver.model.AccountType;
import org.manage.bankserver.strategy.SavingsPolicy;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public class AccountFactory {

    public static Account createAccount(String username, AccountType type) {
        Account account = new Account();

        account.setId(UUID.randomUUID());
        account.setUsername(username);
        account.setBalance(BigDecimal.ZERO);
        account.setType(type);
        account.setCreatedAt(LocalDateTime.now());

        // Назначаем политику в зависимости от типа
        switch (type) {
            case SAVINGS -> account.setPolicy(new SavingsPolicy());

            default -> throw new IllegalArgumentException("Unknown account type: " + type);
        }

        return account;
    }
}
