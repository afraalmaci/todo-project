package com.afra.todo.service;

import com.afra.todo.dto.TodoDto;
import com.afra.todo.model.Tag;
import com.afra.todo.model.Todo;
import com.afra.todo.model.User;
import com.afra.todo.repository.TodoRepository;
import com.afra.todo.repository.UserRepository;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

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

        if ("anonymousUser".equals(username)) {
            return userRepository.findByUsername("guest")
                .orElseGet(() -> {
                    User guest = new User();
                    guest.setUsername("guest");
                    guest.setPassword("$2a$10$XqJfGq3y2V7zZ4bK6MqN9e1T4Y2aB7cD8eF9gH0iJ1kL2mN3oP4qR");
                    return userRepository.save(guest);
                });
        }

        return userRepository.findByUsername(username)
            .orElseThrow(() -> new RuntimeException("User not found: " + username));
    }

    // Convert Todo entity to TodoDto
    private TodoDto convertToDto(Todo todo) {
        TodoDto dto = new TodoDto();
        dto.setId(todo.getId());
        dto.setTitle(todo.getTitle());
        dto.setDescription(todo.getDescription());
        dto.setCompleted(todo.isCompleted());
        dto.setDueDate(todo.getDueDate());
        
        // Extract tag names only (avoid Tag objects)
        if (todo.getTags() != null) {
            Set<String> tagNames = todo.getTags().stream()
                .map(Tag::getName)
                .collect(Collectors.toSet());
            dto.setTags(tagNames);
        }
        
        dto.setUsername(todo.getUser().getUsername());
        return dto;
    }

    public TodoDto createTodo(Todo todo) {
        if (todo.getDueDate() != null && todo.getDueDate().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Due date must be in the future");
        }

        User currentUser = getCurrentUser();
        todo.setUser(currentUser);
        Todo saved = todoRepository.save(todo);
        return convertToDto(saved);
    }

    public List<TodoDto> getAllTodos() {
        User currentUser = getCurrentUser();
        List<Todo> todos = todoRepository.findByUserId(currentUser.getId());
        return todos.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public List<TodoDto> getTodosByTag(String tagName) {
        User currentUser = getCurrentUser();
        List<Todo> todos = todoRepository.findByUserIdAndTagName(currentUser.getId(), tagName);
        return todos.stream()
            .map(this::convertToDto)
            .collect(Collectors.toList());
    }

    public TodoDto updateTodo(Long id, Todo todoDetails) {
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

        Todo updated = todoRepository.save(todo);
        return convertToDto(updated);
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