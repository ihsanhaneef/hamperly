// utils/breadcrumbs.js
class BreadcrumbHelper {
  static generateBreadcrumbs(currentPath, customBreadcrumbs = null) {
    if (customBreadcrumbs) {
      return customBreadcrumbs;
    }

    const breadcrumbs = [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' }
    ];

    // Auto-generate based on path
    if (currentPath.includes('/admin/users')) {
      breadcrumbs.push({ name: 'Users', url: '/admin/users', icon: 'fas fa-users' });
      
      if (currentPath.includes('/create')) {
        breadcrumbs.push({ name: 'Create User', url: null });
      } else if (currentPath.includes('/edit/')) {
        breadcrumbs.push({ name: 'Edit User', url: null });
      } else if (currentPath.includes('/view/')) {
        breadcrumbs.push({ name: 'View User', url: null });
      }
    } else if (currentPath.includes('/admin/categories')) {
      breadcrumbs.push({ name: 'Categories', url: '/admin/categories', icon: 'fas fa-tags' });
      
      if (currentPath.includes('/create')) {
        breadcrumbs.push({ name: 'Create Category', url: null });
      } else if (currentPath.includes('/edit/')) {
        breadcrumbs.push({ name: 'Edit Category', url: null });
      } else if (currentPath.includes('/view/')) {
        breadcrumbs.push({ name: 'View Category', url: null });
      }
    }

    return breadcrumbs;
  }

  static usersBreadcrumbs = {
    index: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Users Management', url: null, icon: 'fas fa-users' }
    ],
    create: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Users', url: '/admin/users', icon: 'fas fa-users' },
      { name: 'Create New User', url: null }
    ],
    edit: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Users', url: '/admin/users', icon: 'fas fa-users' },
      { name: 'Edit User', url: null }
    ],
    view: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Users', url: '/admin/users', icon: 'fas fa-users' },
      { name: 'User Details', url: null }
    ]
  };

  static categoriesBreadcrumbs = {
    index: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Categories Management', url: null, icon: 'fas fa-tags' }
    ],
    create: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Categories', url: '/admin/categories', icon: 'fas fa-tags' },
      { name: 'Create New Category', url: null }
    ],
    edit: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Categories', url: '/admin/categories', icon: 'fas fa-tags' },
      { name: 'Edit Category', url: null }
    ],
    view: [
      { name: 'Dashboard', url: '/admin/dashboard', icon: 'fas fa-tachometer-alt' },
      { name: 'Categories', url: '/admin/categories', icon: 'fas fa-tags' },
      { name: 'Category Details', url: null }
    ]
  };
}

module.exports = BreadcrumbHelper;
