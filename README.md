# Library Management System API

Very basic api for libray management system. This api build using [Express](https://expressjs.com/) and [MongoDb](https://www.mongodb.com/).

## General Rules

- Unregistered user search book by title or author and show the book information.
- After signup a user (aka member), must be approved by admin.
- Only registered user can borrow book.
- Only admin show book borrow information and everything.

## Borrow Rules

- One user maximum borrow 5 (can be changed by env variable BOOK_BORROW_LIMIT) books.
- Same book mutiple copy can't be borrow at the same time.
- Book must have in stock.
- Book must return in 7 (can be changed by env variable BOOK_RETURN_DAYS) days. Otherwise fine will be added.
- fine per day 10 (can be changed by env variable FINE_PER_DAY) tk.
- If fine exceeded 100 (can be changed by env variable MAXIMUM_SAFE_FINE) tk, account will be deactivated.

## System Email Send

- After user account (aka member) active by admin.
- After deactive user account (aka member) when fine exceeded 100 (can be changed by env variable MAXIMUM_SAFE_FINE) tk.
- After active account when member paid all fine amount.

## Database (MongoDB)

- users (collection)
  - name - string
  - email - string
  - password - hash string
  - borrow - array [array of {bookId, date} that how many book a user borrow and borrowing time]
  - isActive - bool
  - fine - number [total fine need to pay]
  - role - string [admin/member]

<br>

- books (collecton)
  - title - string
  - author - string
  - path - string [image url of book cover]
  - borrow - array [array of {userId, date} that how many users borrow a book and borrowing time]
  - qty - number [total copy of that book]

<br>

- In users collection 'email' field is unique (field - Unique Indexes).
- In books collection 'title' and 'author' fields together unique (combination of fields - Unique Indexes).
