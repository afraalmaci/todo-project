package com.afra.todo.model;

import java.util.Set;
import java.util.HashSet;

import jakarta.persistence.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "todos")
public class Todo {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;
    private boolean completed = false;
    private LocalDateTime dueDate ;

    // Which list/category this todo belongs to (e.g. "Work", "Personal").
    // Kept as a plain string rather than a separate entity, same spirit as
    // tags: lists are created implicitly the first time a todo uses them.
    private String listName = "Personal";

    // Manual ordering for drag-and-drop. New todos get the current time in
    // millis so they naturally sort last; reordering overwrites this with
    // small sequential values.
    private Long sortOrder = System.currentTimeMillis();

    @ElementCollection
    @CollectionTable(name = "todo_tags", joinColumns = @JoinColumn(name = "todo_id"))
    @Column(name = "tag_name")
    private Set<Tag> tags = new HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    public Todo() {}

    public Todo(String title, String description) {
        this.title = title;
        this.description = description;
    }

    // Getters and setters
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
    public Set<Tag> getTags() { return tags; }
    public void setTags(Set<Tag> tags) { this.tags = tags; }
    public User getUser() {return user; }
    public void setUser(User user) { this.user = user; }
    public String getListName() { return listName; }
    public void setListName(String listName) { this.listName = listName; }
    public Long getSortOrder() { return sortOrder; }
    public void setSortOrder(Long sortOrder) { this.sortOrder = sortOrder; }

}