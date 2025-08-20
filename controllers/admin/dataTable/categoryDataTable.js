// dataTables/CategoryDataTable.js
const BaseDataTable = require("../../../utils/BaseDataTable");

class CategoryDataTable extends BaseDataTable {
  getColumns() {
     return ["name", "isActive", "actions"];
  }

  getSearchableFields() {
    return ["name", "description", "actions"];
  }

  getFilters() {
    const filters = {};
    
    // Name filter
    if (this.req.query.nameFilter && this.req.query.nameFilter.trim() !== "") {
      filters.name = { 
        $regex: this.req.query.nameFilter.trim(), 
        $options: "i" 
      };
    }

    // Status filter
    if (this.req.query.statusFilter !== undefined && this.req.query.statusFilter !== "") {
      filters.isActive = this.req.query.statusFilter === "1";
    }

    return filters;
  }
  getSortObject() {
    const columns = this.getColumns();
    
    // ✅ Ensure valid column index
    if (this.orderColumn >= 0 && this.orderColumn < columns.length) {
        const sortField = columns[this.orderColumn];
        
        // ✅ Don't sort on actions column - default to name
        if (sortField === "actions" || !sortField) {
            return { name: 1 }; // Default sort
        }
        
        return { [sortField]: this.orderDir === "asc" ? 1 : -1 };
    }
    
    // ✅ Default fallback
    return { name: 1 };
}

  formatRow(category) {
    return [
      this.formatNameColumn(category),
      this.formatStatusColumn(category),
      this.formatActionsColumn(category)
    ];
  }

  formatNameColumn(category) {
    const imageUrl = category.image 
      ? `/uploads/categories/${category.image}`
      : "/uploads/default/default-category.jpg";

    return `
      <div class="category-name dataTable-image-text">
        <img src="${imageUrl}" 
             alt="${category.name}" 
             class="category-thumb dataTable-thumb" 
             onerror="this.src='/uploads/default/default-category.jpg'">
        <div class="category-name-text">
          ${category.name}
        </div>
      </div>
    `;
  }

  formatStatusColumn(category) {
    const statusClass = category.isActive ? "active" : "inactive";
    const statusText = category.isActive ? "Active" : "Inactive";
    
    return `<span class="status-badge ${statusClass}">${statusText}</span>`;
  }

  formatActionsColumn(category) {
    const toggleIcon = category.isActive ? "on" : "off";
    const toggleClass = category.isActive ? "green-icon" : "red-icon";

    return `
      <div class="actions">
        <a href="/admin/categories/view/${category._id}" class="icon-btn" title="View">
          <i class="fas fa-eye blue-icon"></i>
        </a>
        <a href="/admin/categories/edit/${category._id}" class="icon-btn" title="Edit">
          <i class="fas fa-edit green-icon"></i>
        </a>
        <button type="button" class="icon-btn toggle-status" data-id="${category._id}" title="Toggle Status">
          <i class="fas fa-toggle-${toggleIcon} ${toggleClass}"></i>
        </button>
        <form action="/admin/categories/delete/${category._id}" method="POST" style="display:inline;" 
              onsubmit="return confirm('Are you sure? This will also delete the category image.');">
          <button type="submit" class="icon-btn" title="Delete">
            <i class="fas fa-trash-alt red-icon"></i>
          </button>
        </form>
      </div>
    `;
  }
}

module.exports = CategoryDataTable;
