CREATE TABLE todo_tags (
    todo_id BIGINT NOT NULL,
    tag_name VARCHAR(255),
    CONSTRAINT fk_todo FOREIGN KEY(todo_id) REFERENCES todos(id) ON DELETE CASCADE
);