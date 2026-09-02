package com.afra.todo.controller;

import com.afra.todo.dto.TodoDto;
import com.afra.todo.model.Todo;
import com.afra.todo.service.TodoService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/todos")
public class TodoController {

    private final TodoService todoService;

    public TodoController(TodoService todoService) {
        this.todoService = todoService;
    }

    @GetMapping
    public List<TodoDto> getAllTodos(@RequestParam(required = false) String tag) {
        if (tag != null && !tag.trim().isEmpty()) {
            return todoService.getTodosByTag(tag.trim());
        }
        return todoService.getAllTodos();
    }

    @PostMapping
    public TodoDto createTodo(@RequestBody Todo todo) {
        return todoService.createTodo(todo);
    }

    @PutMapping("/{id}")
    public TodoDto updateTodo(@PathVariable Long id, @RequestBody Todo todoDetails) {
        return todoService.updateTodo(id, todoDetails);
    }

    @DeleteMapping("/{id}")
    public void deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
    }
}