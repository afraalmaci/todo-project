package com.afra.todo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.afra.todo.model.Todo;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    // Get all todos for a specific user (by user ID)
    List<Todo> findByUserId(Long userId);

    // Get todos for a user that have a specific tag
    @Query("SELECT t FROM Todo t JOIN t.tags tag WHERE t.user.id = :userId AND tag.name = :tagName")
    List<Todo> findByUserIdAndTagName(@Param("userId") Long userId, @Param("tagName") String tagName);

}