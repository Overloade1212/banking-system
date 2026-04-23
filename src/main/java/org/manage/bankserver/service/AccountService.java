package org.manage.bankserver.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.manage.bankserver.dto.AccountResponse;
import org.manage.bankserver.dto.RegisterAccountRequest;
import org.manage.bankserver.entity.Account;
import org.manage.bankserver.entity.enums.AccountType;
import org.manage.bankserver.repository.AccountRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.UUID;

@RequiredArgsConstructor
@Service
@Transactional
public class AccountService  {
    private  final AccountRepository repository;

    public AccountResponse registerAccount(RegisterAccountRequest request){

        if (repository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Such account already exists!");
        }

        Account entity = Account.builder()
                .username(request.getUsername())
                .type(AccountType.valueOf(request.getType()))
                .balance(BigDecimal.ZERO) // обязательно!
                .build();

        Account saved = repository.save(entity);

        return AccountResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .balance(saved.getBalance())
                .type(saved.getType().name())
                .createdAt(saved.getCreatedAt())
                .build();
    }
    public AccountResponse deposit(UUID id, BigDecimal amount) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.deposit(amount);

        Account saved = repository.save(account);

        return AccountResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .balance(saved.getBalance())
                .type(saved.getType().name())
                .createdAt(saved.getCreatedAt())
                .build();
    }
    public AccountResponse withdraw(UUID id, BigDecimal amount) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        account.withdraw(amount); // ← тут работает твоя Strategy!

        Account saved = repository.save(account);

        return AccountResponse.builder()
                .id(saved.getId())
                .username(saved.getUsername())
                .balance(saved.getBalance())
                .type(saved.getType().name())
                .createdAt(saved.getCreatedAt())
                .build();
    }
    public AccountResponse getAccount(UUID id) {
        Account account = repository.findById(id)
                .orElseThrow(() -> new RuntimeException("Account not found"));

        return AccountResponse.builder()
                .id(account.getId())
                .username(account.getUsername())
                .balance(account.getBalance())
                .type(account.getType().name())
                .createdAt(account.getCreatedAt())
                .build();
    }
}
