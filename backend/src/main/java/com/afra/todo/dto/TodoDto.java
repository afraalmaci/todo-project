package com.afra.todo.dto;

import java.time.LocalDateTime;
import java.util.Set;

public class TodoDto {
    private Long id;
    private String title;
    private String description;
    private boolean completed;
    private LocalDateTime dueDate;
    private Set<String> tags; // Just tag names, not Tag objects
    private String username;
    private String listName;
    private Long sortOrder;

    public TodoDto() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public boolean isCompleted() { return completed; }
    public void setCompleted(boolean completed) { this.completed = completed; }

    public LocalDateTime getDueDate() { return dueDate; }
    public void setDueDate(LocalDateTime dueDate) { this.dueDate = dueDate; }

    public Set<String> getTags() { return tags; }
    public void setTags(Set<String> tags) { this.tags = tags; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getListName() { return listName; }
    public void setListName(String listName) { this.listName = listName; }

    public Long getSortOrder() { return sortOrder; }
    public void setSortOrder(Long sortOrder) { this.sortOrder = sortOrder; }
}