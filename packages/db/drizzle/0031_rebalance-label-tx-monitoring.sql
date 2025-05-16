-- Custom SQL migration file, put your code below! --
insert into glider_portfolio_rebalances_log_labels(name, id)
values ('TX_EXECUTION_RUNNING', 41),
       ('TX_EXECUTION_COMPLETED', 51),
       ('TX_EXECUTION_FAILED', -41),
       ('TX_EXECUTION_NOT_COMPLETED', -54),
       ('TX_EXECUTION_RESULTED_FALSE', -55),
       ('TX_EXECUTION_BACKOFF_EXHAUSTED', -56)