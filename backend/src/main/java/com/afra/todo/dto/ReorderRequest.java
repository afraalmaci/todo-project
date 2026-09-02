package com.afra.todo.dto;

import java.util.List;

// Body for PUT /api/todos/reorder: the todo ids in their new display order.
public class ReorderRequest {
    private List<Long> ids;

    public ReorderRequest() {}

    public List<Long> getIds() { return ids; }
    public void setIds(List<Long> ids) { this.ids = ids; }
}
