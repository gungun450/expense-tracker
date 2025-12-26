create database expenseTracker;
use expenseTracker;

create table users(
Uid int primary key auto_increment,
name varchar(50) not null,
username varchar(50) not null,
email varchar(50) not null unique,
passwords varchar(255) unique,
phoneNumber varchar(20),
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp,
active_yn int default 1
);

create table category(
Cid int primary key auto_increment,
Uid int not null,
name varchar(50),
description varchar(75),
iconUrl VARCHAR(255),
type enum('Income', 'Expense') not null default 'Expense',
created_at timestamp default current_timestamp,
updated_at timestamp default current_timestamp,
active_yn int default 1 ,
foreign key (Uid) references users(Uid) on delete cascade
);


create table Transaction(
 Tid int primary key auto_increment,
 Uid int ,
 Cid int,
 amount decimal(10,2),
 notes varchar(75),
 dateOfTransaction date not null,
 created_at timestamp default current_timestamp,
 updated_at timestamp default current_timestamp on update current_timestamp,
 active_yn int default 1 ,
foreign key (Uid) references users(Uid),
foreign key (Cid) references category(Cid)
);


insert into users(name,username,email,passwords,phoneNumber) values('Gungun','Gungunnarwani','Gungunnarwani@gmail.com','123456abc','1234567890');
insert into users(name,username,email,passwords,phoneNumber) values('Yashika','yashika','yashika@gmail.com','12356abc','1234567890');

select * from users;

insert into category(Uid,name, description) values(1,'Shopping','clothes');
insert into category(Uid,name, description) values(2,'food','JK');

select * from category;

insert into Transaction (Uid,Cid,amount,notes, dateOfTransaction) values(1,2,2000.00,'IDK','2025-8-12');
insert into Transaction (Uid,Cid,amount,notes, dateOfTransaction) values(2,1,5000.00,'IDK','2025-8-12');

select * from Transaction;