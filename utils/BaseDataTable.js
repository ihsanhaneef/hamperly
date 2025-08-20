// utils/BaseDataTable.js
class BaseDataTable {
  constructor(model, req) {
    this.model = model;
    this.req = req;
    this.draw = parseInt(req.query.draw) || 1;
    this.start = parseInt(req.query.start) || 0;
    this.length = parseInt(req.query.length) || 10;
    this.searchValue = req.query.search?.value || "";
    
    // ✅ FIXED: Use correct parameter names without problematic syntax
    this.orderColumn = parseInt(req.query['order[0][column]']) || 0;
    this.orderDir = req.query['order[dir]'] || "asc";
    
    // ✅ Add debug logging
    console.log('DataTable constructor params:', {
      orderColumn: this.orderColumn,
      orderDir: this.orderDir,
      rawParams: {
        'order[column]': req.query['order[column]'],
        'order[dir]': req.query['order[dir]'],
        nameFilter: req.query.nameFilter,
        statusFilter: req.query.statusFilter
      }
    });
  }

  // Override in child classes
  getColumns() {
    return [];
  }

  // Override in child classes
  getSearchableFields() {
    return [];
  }

  // Override in child classes
  getFilters() {
    return {};
  }

  // Override in child classes
  formatRow(item) {
    return [];
  }

  buildSearchQuery() {
    const searchableFields = this.getSearchableFields();
    if (!this.searchValue || searchableFields.length === 0) {
      return {};
    }

    return {
      $or: searchableFields.map((field) => ({
        [field]: { $regex: this.searchValue, $options: "i" },
      })),
    };
  }

  buildFilterQuery() {
    return this.getFilters();
  }

  buildMainQuery() {
    const searchQuery = this.buildSearchQuery();
    const filterQuery = this.buildFilterQuery();

    const conditions = [];

    if (Object.keys(searchQuery).length > 0) {
      conditions.push(searchQuery);
    }

    if (Object.keys(filterQuery).length > 0) {
      conditions.push(filterQuery);
    }

    return conditions.length > 0 ? { $and: conditions } : {};
  }

  getSortObject() {
    const columns = this.getColumns();
    
    console.log('getSortObject debug:', {
      orderColumn: this.orderColumn,
      orderDir: this.orderDir,
      columns: columns
    });
    
    // ✅ Ensure we have a valid column index
    if (this.orderColumn >= 0 && this.orderColumn < columns.length) {
      const sortField = columns[this.orderColumn];
      
      if (sortField === "actions") {
        return { index: 1 }; // Default to name ascending
      }
      
      return { [sortField]: this.orderDir === "asc" ? 1 : -1 };
    }
    
    // ✅ Default fallback
    return { name: 1 };
  }

  async getTotalCount() {
    return await this.model.countDocuments({});
  }

  async getFilteredCount(query) {
    return await this.model.countDocuments(query);
  }

  async getData(query, sortObject) {
    return await this.model
      .find(query)
      .sort(sortObject)
      .skip(this.start)
      .limit(this.length)
      .lean();
  }

  async processRequest() {
    try {
      const query = this.buildMainQuery();
      const sortObject = this.getSortObject();

      console.log('Processing request with:', {
        query: JSON.stringify(query),
        sortObject: JSON.stringify(sortObject)
      });

      const [recordsTotal, recordsFiltered, data] = await Promise.all([
        this.getTotalCount(),
        this.getFilteredCount(query),
        this.getData(query, sortObject),
      ]);

      const formattedData = data.map((item) => this.formatRow(item));

      return {
        draw: this.draw,
        recordsTotal,
        recordsFiltered,
        data: formattedData,
      };
    } catch (error) {
      console.error('BaseDataTable processRequest error:', error);
      throw error;
    }
  }
}

module.exports = BaseDataTable;
