const Category = require('../models/Category');
const Asset = require('../models/Asset');

// Create new category
exports.createCategory = async (req, res) => {
  try {
    const { name, code, description, status, parentCategory } = req.body;

    // Validate parent category if provided
    if (parentCategory) {
      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    // Check if name already exists
    const existingName = await Category.findOne({ name: name.trim() });
    if (existingName) {
      return res.status(400).json({ message: 'Category name already exists' });
    }

    // Check if code already exists (if provided)
    if (code && code.trim()) {
      const existingCode = await Category.findOne({ code: code.trim() });
      if (existingCode) {
        return res.status(400).json({ message: 'Category code already exists' });
      }
    }

    const category = await Category.create({
      name: name.trim(),
      code: code ? code.trim() : undefined,
      description: description ? description.trim() : undefined,
      status: status || 'Active',
      parentCategory: parentCategory || undefined
    });

    // Populate parent category for response
    if (category.parentCategory) {
      await category.populate('parentCategory', 'name code');
    }

    res.status(201).json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ message: 'Error creating category' });
  }
};

// Get all categories
exports.listCategories = async (req, res) => {
  try {
    const categories = await Category.find()
      .populate('parentCategory', 'name code')
      .sort({ name: 1 });

    res.json(categories);
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// Get single category by ID
exports.getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('parentCategory', 'name code');

    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    res.json(category);
  } catch (error) {
    console.error('Error fetching category:', error);
    res.status(500).json({ message: 'Error fetching category' });
  }
};

// Update category
exports.updateCategory = async (req, res) => {
  try {
    const { name, code, description, status, parentCategory } = req.body;
    const categoryId = req.params.id;

    // Check if category exists
    const existingCategory = await Category.findById(categoryId);
    if (!existingCategory) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Validate parent category if provided
    if (parentCategory) {
      // Prevent circular references
      if (parentCategory === categoryId) {
        return res.status(400).json({ message: 'Category cannot be its own parent' });
      }

      const parent = await Category.findById(parentCategory);
      if (!parent) {
        return res.status(400).json({ message: 'Parent category not found' });
      }
    }

    // Check if name already exists (excluding current category)
    if (name && name.trim() !== existingCategory.name) {
      const existingName = await Category.findOne({ 
        name: name.trim(), 
        _id: { $ne: categoryId } 
      });
      if (existingName) {
        return res.status(400).json({ message: 'Category name already exists' });
      }
    }

    // Check if code already exists (excluding current category)
    if (code && code.trim() !== existingCategory.code) {
      const existingCode = await Category.findOne({ 
        code: code.trim(), 
        _id: { $ne: categoryId } 
      });
      if (existingCode) {
        return res.status(400).json({ message: 'Category code already exists' });
      }
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      categoryId,
      {
        name: name ? name.trim() : existingCategory.name,
        code: code ? code.trim() : existingCategory.code,
        description: description !== undefined ? (description ? description.trim() : undefined) : existingCategory.description,
        status: status || existingCategory.status,
        parentCategory: parentCategory !== undefined ? (parentCategory || undefined) : existingCategory.parentCategory
      },
      { new: true, runValidators: true }
    ).populate('parentCategory', 'name code');

    res.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ message: 'Error updating category' });
  }
};

// Delete category
exports.deleteCategory = async (req, res) => {
  try {
    const categoryId = req.params.id;

    // Check if category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: 'Category not found' });
    }

    // Check if category has assets
    const assetCount = await Asset.countDocuments({ category: categoryId });
    if (assetCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${assetCount} associated asset(s).` 
      });
    }

    // Check if category has child categories
    const childCount = await Category.countDocuments({ parentCategory: categoryId });
    if (childCount > 0) {
      return res.status(400).json({ 
        message: `Cannot delete category. It has ${childCount} child category(ies).` 
      });
    }

    await Category.findByIdAndDelete(categoryId);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ message: 'Error deleting category' });
  }
};

// Get category statistics
exports.getCategoryStats = async (req, res) => {
  try {
    const stats = await Category.aggregate([
      {
        $group: {
          _id: null,
          totalCategories: { $sum: 1 },
          activeCategories: {
            $sum: { $cond: [{ $eq: ['$status', 'Active'] }, 1, 0] }
          },
          inactiveCategories: {
            $sum: { $cond: [{ $eq: ['$status', 'Inactive'] }, 1, 0] }
          },
          parentCategories: {
            $sum: { $cond: [{ $eq: ['$parentCategory', null] }, 1, 0] }
          },
          childCategories: {
            $sum: { $cond: [{ $ne: ['$parentCategory', null] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length === 0) {
      return res.json({
        totalCategories: 0,
        activeCategories: 0,
        inactiveCategories: 0,
        parentCategories: 0,
        childCategories: 0
      });
    }

    res.json(stats[0]);
  } catch (error) {
    console.error('Error fetching category stats:', error);
    res.status(500).json({ message: 'Error fetching category statistics' });
  }
};


