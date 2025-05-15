-- Custom SQL migration file, put your code below! --
insert into account_entities(id, label)
values (0, 'Vitalik')
on conflict do nothing ;

insert into contracts(id, address)
values (0, '0x0000000000000000000000000000000000000000')
on conflict do nothing ;

insert into tokens(id, name, symbol, address, total_supply,
                   deployment_contract_id, account_entity_id, deployment_transaction_hash,
                   block)
values (0, 'Ethereum', 'ETH', '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', 9223372036854775807 /*bigint::max*/,
        0, 0, '0x0', 0)
on conflict do nothing ;
