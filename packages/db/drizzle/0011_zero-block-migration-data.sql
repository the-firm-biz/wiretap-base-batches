-- Custom SQL migration file, put your code below! --
insert into blocks(number, timestamp) values (0, to_timestamp(0));

update tokens set block = 0 where block is null;