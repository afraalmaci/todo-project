package com.afra.todo.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.afra.todo.model.Todo;
import com.afra.todo.model.User;
import com.afra.todo.repository.TodoRepository;
import com.afra.todo.repository.UserRepository;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class TodoService {

    private final TodoRepository todoRepository;
    private final UserRepository userRepository;

    public TodoService(TodoRepository todoRepository, UserRepository userRepository) {
        this.todoRepository = todoRepository;
        this.userRepository = userRepository;
    }

    private User getCurrentUser() {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();

    // Allow unauthenticated access in development by using a default user
    if ("anonymousUser".equals(username)) {
        // Try to find or create a default "guest" user
        return userRepository.findByUsername("guest")
            .orElseGet(() -> {
                User guest = new User();
                guest.setUsername("guest");
                guest.setPassword("$2a$10$XqJfGq3y2V7zZ4bK6MqN9e1T4Y2aB7cD8eF9gH0iJ1kL2mN3oP4qR"); // bcrypt of "guest"
                return userRepository.save(guest);
            });
    }

    return userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found: " + username));
}
    public Todo createTodo(Todo todo) {
        // Validate due date is in the future 
        if (todo.getDueDate() != null && todo.getDueDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Due date must be in the future");
        }

        User currentUser = getCurrentUser();
        todo.setUser(currentUser);
        return todoRepository.save(todo);
    }

    public List<Todo> getAllTodos() {
        User currentUser = getCurrentUser();
        return todoRepository.findByUserId(currentUser.getId());
    }

    public List<Todo> getTodosByTag(String tagName) {
        User currentUser = getCurrentUser();
        return todoRepository.findByUserIdAndTagName(currentUser.getId(), tagName);
    }

    public Todo updateTodo(Long id, Todo todoDetails) {
        Todo todo = todoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));

        User currentUser = getCurrentUser();
        if (!todo.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only update your own todos");
        }

        if (todoDetails.getDueDate() != null) {
            if (todoDetails.getDueDate().isBefore(LocalDateTime.now())) {
                throw new IllegalArgumentException("Due date must be in the future");
            }
            todo.setDueDate(todoDetails.getDueDate());
        }

        todo.setTitle(todoDetails.getTitle());
        todo.setDescription(todoDetails.getDescription());
        todo.setCompleted(todoDetails.isCompleted());
        todo.setTags(todoDetails.getTags());

        return todoRepository.save(todo);
    }

    public void deleteTodo(Long id) {
        Todo todo = todoRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id));

        User currentUser = getCurrentUser();
        if (!todo.getUser().getId().equals(currentUser.getId())) {
            throw new RuntimeException("You can only delete your own todos");
        }

        todoRepository.delete(todo);
    }
}