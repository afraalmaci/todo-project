package com.afra.todo.controller;

import com.afra.todo.dto.ReorderRequest;
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
    public List<TodoDto> getAllTodos(
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String list) {
        if (tag != null && !tag.trim().isEmpty()) {
            return todoService.getTodosByTag(tag.trim());
        }
        if (list != null && !list.trim().isEmpty()) {
            return todoService.getTodosByList(list.trim());
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

    @PutMapping("/reorder")
    public List<TodoDto> reorderTodos(@RequestBody ReorderRequest request) {
        return todoService.reorderTodos(request.getIds());
    }

    @DeleteMapping("/{id}")
    public void deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
    }
}
