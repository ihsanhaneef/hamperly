const User = require('../../../models/User');
const logger = require('../../../config/logger');

const getUsersDataTable = async (req, res) => {
    logger.info('Fetching users for DataTable with column filters');
    console.log('=== DataTable Request with Column Filters ===');
    console.log('Query params:', req.query);
    
    try {
        // Get DataTables parameters
        const draw = parseInt(req.query.draw) || 1;
        const start = parseInt(req.query.start) || 0;
        const length = parseInt(req.query.length) || 10;
        const searchValue = req.query.search?.value || '';
        const orderColumn = parseInt(req.query.order?.[0]?.column) || 0;
        const orderDir = req.query.order?.dir || 'asc';
        
        // Get individual column filter parameters
        const nameFilter = req.query.nameFilter || '';
        const usernameFilter = req.query.usernameFilter || '';
        const emailFilter = req.query.emailFilter || '';
        const roleFilter = req.query.roleFilter || '';
        
        console.log('Individual Column Filters:', {
            nameFilter,
            usernameFilter,
            emailFilter,
            roleFilter,
            globalSearch: searchValue
        });

        // Column mapping
        const columns = ['name', 'username', 'email', 'is_admin'];
        const sortField = columns[orderColumn] || 'name';

        // Build MongoDB query with individual column filters
        let matchConditions = [];

        // Global search (from DataTables search box)
        if (searchValue) {
            matchConditions.push({
                $or: [
                    { name: { $regex: searchValue, $options: 'i' } },
                    { username: { $regex: searchValue, $options: 'i' } },
                    { email: { $regex: searchValue, $options: 'i' } }
                ]
            });
        }

        // Individual column filters
        if (nameFilter) {
            matchConditions.push({
                name: { $regex: nameFilter, $options: 'i' }
            });
        }

        if (usernameFilter) {
            matchConditions.push({
                username: { $regex: usernameFilter, $options: 'i' }
            });
        }

        if (emailFilter) {
            matchConditions.push({
                email: { $regex: emailFilter, $options: 'i' }
            });
        }

        if (roleFilter) {
            const isAdmin = roleFilter === '1' ? 1 : 2; // Assuming '1' is Admin and '2' is User
            matchConditions.push({
                is_admin: isAdmin
            });
        }

        // Combine all conditions with AND logic
        let matchQuery = {};
        if (matchConditions.length > 0) {
            matchQuery = { $and: matchConditions };
        }

        console.log('Final MongoDB query:', JSON.stringify(matchQuery, null, 2));

        // Get total records (without any filters)
        const recordsTotal = await User.countDocuments({});
        
        // Get filtered records count (with all filters applied)
        const recordsFiltered = await User.countDocuments(matchQuery);

        // Get paginated data
        const sortObject = {};
        sortObject[sortField] = orderDir === 'asc' ? 1 : -1;

        const users = await User.find(matchQuery)
            .sort(sortObject)
            .skip(start)
            .limit(length)
            .lean();

        console.log(`Found ${users.length} users after filtering`);
        console.log(`Total records: ${recordsTotal}, Filtered records: ${recordsFiltered}`);

        // Format data for DataTables
        const data = users.map(user => [
            user.name || '',
            user.username || '',
            user.email || '',
            user.is_admin === 1 ? 'Admin' : 'User',
            `<div class="actions">
                <a href="/admin/users/view/${user._id}" class="icon-btn" title="View">
                    <i class="fas fa-eye blue-icon"></i>
                </a>
                <a href="/admin/users/edit/${user._id}" class="icon-btn" title="Edit">
                    <i class="fas fa-edit green-icon"></i>
                </a>
                <form action="/admin/users/delete/${user._id}" method="POST" style="display:inline;" onsubmit="return confirm('Are you sure?');">
                    <button type="submit" class="icon-btn" title="Delete">
                        <i class="fas fa-trash-alt red-icon"></i>
                    </button>
                </form>
            </div>`
        ]);

        // Response format for DataTables
        const response = {
            draw: draw,
            recordsTotal: recordsTotal,
            recordsFiltered: recordsFiltered,
            data: data
        };

        console.log('Sending response:', {
            draw: response.draw,
            recordsTotal: response.recordsTotal,
            recordsFiltered: response.recordsFiltered,
            dataLength: response.data.length
        });

        res.json(response);

    } catch (err) {
        console.error('DataTable Error:', err);
        logger.error(`DataTable Users Error: ${err.message}`);
        res.status(500).json({
            draw: req.query.draw || 1,
            recordsTotal: 0,
            recordsFiltered: 0,
            data: [],
            error: err.message
        });
    }
};

module.exports = { getUsersDataTable };
