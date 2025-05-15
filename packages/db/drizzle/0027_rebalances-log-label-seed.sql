-- Custom SQL migration file, put your code below! --
insert into glider_portfolio_rebalances_log_labels(name, id)
values ('SET_FULL_ETH', 0),
       ('CREATED', 10),
       ('UPDATED', 20),
       ('TRIGGERED', 30),
       ('REBALANCE_RUNNING', 40),
       ('REBALANCE_COMPLETED', 50),
       ('WITHDRAW_REQUESTED', 60),

       ('ERROR', -10),
       ('ERROR_SET_FULL_ETH', -11),
       ('UPDATE_FAILED', -20),
       ('TRIGGER_FAILED', -30),
       ('REBALANCE_FAILED', -40),
       ('REBALANCE_NOT_COMPLETED', -50),
       ('REBALANCE_EXECUTION_FAILURE', -51),
       ('REBALANCE_BACKOFF_EXHAUSTED', -52),
       ('WITHDRAW_REQUEST_FAILED', -60)