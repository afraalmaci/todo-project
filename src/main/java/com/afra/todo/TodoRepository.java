package com.afra.todo;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {
    
    @Query("SELECT t FROM Todo t JOIN t.tags tag WHERE tag.name = :tagName")
        List<Todo> findByTagName(@Param("tagName") String tagName);
        
}