-- Custom SQL migration file, put your code below! --
insert into glider_portfolio_rebalances_log_labels(name, id)
values ('TRIGGERED_VIA_TX', 31),
       ('TRIGGER_VIA_TX_FAILED', -31)
