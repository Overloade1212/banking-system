package org.manage.bankserver.service;

import lombok.RequiredArgsConstructor;
import org.manage.bankserver.entity.Transaction;
import org.manage.bankserver.repository.TransactionRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TransactionService {

    private final TransactionRepository transactionRepository;

    public List<Transaction> getTransactionsByAccountId(UUID accountId) {
        return transactionRepository.findByAccountId(accountId);
    }
}