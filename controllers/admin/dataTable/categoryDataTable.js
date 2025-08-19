const Category = require("../../../models/Category");
const logger = require("../../../config/logger");

const getCategoriesDataTable = async (req, res) => {
  try {
    const draw = parseInt(req.query.draw) || 1;
    const start = parseInt(req.query.start) || 0;
    const length = parseInt(req.query.length) || 10;
    const searchValue = req.query.search?.value || "";
    const orderColumn = parseInt(req.query.order?.[0]?.column) || 0;
    const orderDir = req.query.order?.dir || "asc";

    const nameFilter = req.query.nameFilter || "";
    const statusFilter = req.query.statusFilter || "";

    // Column mapping
    const columns = ["name", "isActive"];
    const sortField = columns[orderColumn] || "name";

    // Build MongoDB query
    let matchConditions = [];

    if (searchValue) {
      matchConditions.push({
        $or: [
          { name: { $regex: searchValue, $options: "i" } },
          { description: { $regex: searchValue, $options: "i" } }
        ]
      });
    }

    // Individual column filters
    if (nameFilter) {
      matchConditions.push({
        name: { $regex: nameFilter, $options: "i" }
      });
    }

    if (statusFilter !== "") {
      matchConditions.push({
        isActive: statusFilter === "1" ? true : false
      });
    }

    // Combine all conditions
    let matchQuery = {};
    if (matchConditions.length > 0) {
      matchQuery = { $and: matchConditions };
    }

    // Get total and filtered counts
    const recordsTotal = await Category.countDocuments({});
    const recordsFiltered = await Category.countDocuments(matchQuery);

    // Get paginated data
    const sortObject = {};
    sortObject[sortField] = orderDir === "asc" ? 1 : -1;

    const categories = await Category.find(matchQuery)
      .sort(sortObject)
      .skip(start)
      .limit(length)
      .lean();

    // Format data for DataTables
    const data = categories.map((category) => [
      `<div class="category-name dataTable-image-text">
      
        <img src="${
          category.image
            ? "/uploads/categories/" + category.image
            : "/uploads/default/default-category.jpg"
        }" 
             alt="${category.name}" 
             class="category-thumb dataTable-thumb" 
             onerror="this.src='/uploads/default/default-category.jpg'">
             <div class="category-name-text">
        ${category.name}
        </div>
      </div>`,
      `<span class="status-badge ${
        category.isActive ? "active" : "inactive"
      }">
        ${category.isActive ? "Active" : "Inactive"}
      </span>`,
      `<div class="actions">
        <a href="/admin/categories/view/${category._id}" class="icon-btn" title="View">
            <i class="fas fa-eye blue-icon"></i>
        </a>
        <a href="/admin/categories/edit/${category._id}" class="icon-btn" title="Edit">
            <i class="fas fa-edit green-icon"></i>
        </a>
        <button type="button" class="icon-btn toggle-status" data-id="${category._id}" title="Toggle Status">
            <i class="fas fa-toggle-${
              category.isActive ? "on" : "off"
            } ${category.isActive ? "green-icon" : "gray-icon"}"></i>
        </button>
        <form action="/admin/categories/delete/${
          category._id
        }" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure? This will also delete the category image.');">
            <button type="submit" class="icon-btn" title="Delete">
                <i class="fas fa-trash-alt red-icon"></i>
            </button>
        </form>
      </div>`
    ]);

    res.json({
      draw: draw,
      recordsTotal: recordsTotal,
      recordsFiltered: recordsFiltered,
      data: data
    });

  } catch (err) {
    logger.error(`DataTable Categories Error: ${err.message}`);
    res.status(500).json({
      draw: req.query.draw || 1,
      recordsTotal: 0,
      recordsFiltered: 0,
      data: [],
      error: err.message
    });
  }
};

module.exports = { getCategoriesDataTable };