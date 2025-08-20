// dataTables/UserDataTable.js
const BaseDataTable = require("../../../utils/BaseDataTable");

class UserDataTable extends BaseDataTable {
  getColumns() {
    // Simplified to match category structure
    return ["name", "username", "email", "is_admin", "actions"];
  }

  getSearchableFields() {
    return ["name", "username", "email"];
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

    // Username filter
    if (this.req.query.usernameFilter && this.req.query.usernameFilter.trim() !== "") {
      filters.username = { 
        $regex: this.req.query.usernameFilter.trim(), 
        $options: "i" 
      };
    }

    // Email filter
    if (this.req.query.emailFilter && this.req.query.emailFilter.trim() !== "") {
      filters.email = { 
        $regex: this.req.query.emailFilter.trim(), 
        $options: "i" 
      };
    }

    // Role filter
    if (this.req.query.roleFilter !== undefined && this.req.query.roleFilter !== "") {
      filters.is_admin = parseInt(this.req.query.roleFilter);
    }

    return filters;
  }

  getSortObject() {
    const columns = this.getColumns();
    
    // Ensure valid column index
    if (this.orderColumn >= 0 && this.orderColumn < columns.length) {
      const sortField = columns[this.orderColumn];
      
      // Don't sort on actions column - default to name
      if (sortField === "actions" || !sortField) {
        return { name: 1 }; // Default sort
      }
      
      return { [sortField]: this.orderDir === "asc" ? 1 : -1 };
    }
    
    // Default fallback
    return { name: 1 };
  }

formatRow(user) {
  return [
    user.name,           // column 1: Name
    user.username,       // column 2: Username
    user.email,          // column 3: Email
    this.formatRoleColumn(user),
    this.formatActionsColumn(user)
  ];
}

  formatIndexColumn(user)
  {
    return `<span>${this.index++}</span>`;

  }
formatNameColumn(user) {
  return `<span>${user.name}</span>`;
}

  formatUsernameColumn(user) {
    return `<span class="text-monospace">${user.username}</span>`;
  }

  formatEmailColumn(user) {
    return `${user.email}`;
  }

  formatRoleColumn(user) {
    const isAdmin = user.is_admin === 1;
    const roleClass = isAdmin ? "active" : "inactive";
    const roleText = isAdmin ? "Admin" : "User";
    
    return `<span class="status-badge ${roleClass}">${roleText}</span>`;
  }

  formatActionsColumn(user) {
    const isAdmin = user.is_admin === 1;
    const toggleIcon = isAdmin ? "toggle-on" : "toggle-off";
    const toggleClass = isAdmin ? "green-icon" : "red-icon";

    return `
      <div class="actions">
        <a href="/admin/users/view/${user._id}" class="icon-btn" title="View">
          <i class="fas fa-eye blue-icon"></i>
        </a>
        <a href="/admin/users/edit/${user._id}" class="icon-btn" title="Edit">
          <i class="fas fa-edit green-icon"></i>
        </a>

        <form action="/admin/users/delete/${user._id}" method="POST" style="display:inline;" 
              onsubmit="return confirm('Are you sure? This will permanently delete the user.');">
          <button type="submit" class="icon-btn" title="Delete">
            <i class="fas fa-trash-alt red-icon"></i>
          </button>
        </form>
      </div>
    `;
  }

  // Override to exclude password from results
  async getData(query, sortObject) {
    return await this.model
      .find(query)
      .select('-password')
      .sort(sortObject)
      .skip(this.start)
      .limit(this.length)
      .lean();
  }
}

module.exports = UserDataTable;
