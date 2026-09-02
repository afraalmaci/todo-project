
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS todos (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255),
    description TEXT,
    completed BOOLEAN DEFAULT FALSE,
    due_date TIMESTAMP,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_user FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS todo_tags (
    todo_id BIGINT NOT NULL,
    name VARCHAR(255),
    PRIMARY KEY(todo_id, tag_name),
    CONSTRAINT fk_todo FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE
);