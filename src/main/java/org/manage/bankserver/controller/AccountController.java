package org.manage.bankserver.controller;

import lombok.RequiredArgsConstructor;
import org.manage.bankserver.dto.AccountResponse;
import org.manage.bankserver.dto.RegisterAccountRequest;
import org.manage.bankserver.service.AccountService;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.UUID;

@RestController
@RequestMapping("/api/accounts")
@RequiredArgsConstructor
public class AccountController {

    private final AccountService accountService;

    @PostMapping
    public AccountResponse registerAccount(@RequestBody RegisterAccountRequest request) {
        return accountService.registerAccount(request);
    }
    @PostMapping("/{id}/deposit")
    public AccountResponse deposit(@PathVariable UUID id,
                                   @RequestParam BigDecimal amount) {
        return accountService.deposit(id, amount);
    }
    @PostMapping("/{id}/withdraw")
    public AccountResponse withdraw(@PathVariable UUID id,
                                    @RequestParam BigDecimal amount) {
        return accountService.withdraw(id, amount);
    }
    @GetMapping("/{id}")
    public AccountResponse getAccount(@PathVariable UUID id) {
        return accountService.getAccount(id);
    }
}