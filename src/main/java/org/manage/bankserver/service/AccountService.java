package org.manage.bankserver.service;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.manage.bankserver.dto.RegisterAccountRequest;
import org.manage.bankserver.entity.Account;
import org.manage.bankserver.entity.enums.AccountType;
import org.manage.bankserver.repository.AccountRepository;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
@Transactional
public class AccountService  {
    private  final AccountRepository repository;

     public void registerAccount(RegisterAccountRequest request){

         if (repository.existsByUsername(request.getUsername())) {
             //TODO: Заменить на свой AccauntAlreadyExistsExeption()
             throw new RuntimeException("Such account already exists!");
         }

         Account entity = Account.builder()
                 .username(request.getUsername())
                 .type(AccountType.valueOf(request.getType()))
                 .build();

         repository.save(entity);
     }
}
