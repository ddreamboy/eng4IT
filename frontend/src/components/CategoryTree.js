// eng4IT/frontend/src/components/CategoryTree.js
import React, { useState } from "react";
import { ChevronRight, ChevronDown, Folder, FolderOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const CategoryItem = ({ category, level = 0, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = category.children && category.children.length > 0;

  return (
    <div className="select-none">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className={`
          flex items-center space-x-2 p-2 rounded-lg cursor-pointer
          hover:bg-gray-800 transition-colors
        `}
        style={{ paddingLeft: `${level * 20 + 8}px` }}
        onClick={() => {
          if (hasChildren) {
            setIsOpen(!isOpen);
          }
          onSelect(category);
        }}
      >
        {hasChildren ? (
          <span className="text-gray-400">
            {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </span>
        ) : (
          <span className="w-[18px]" />
        )}
        <span className="text-primary">
          {isOpen ? <FolderOpen size={18} /> : <Folder size={18} />}
        </span>
        <span className="text-gray-200">{category.name}</span>
        {category.metadata?.count && (
          <span className="text-xs text-gray-400">
            ({category.metadata.count})
          </span>
        )}
      </motion.div>

      <AnimatePresence>
        {isOpen && hasChildren && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
          >
            {category.children.map((child) => (
              <CategoryItem
                key={child.id}
                category={child}
                level={level + 1}
                onSelect={onSelect}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CategoryTree = ({ categories, onSelectCategory }) => {
  return (
    <div className="bg-dark-card border border-gray-800 rounded-xl p-4">
      <h3 className="text-lg font-semibold text-primary mb-4">Categories</h3>
      <div className="space-y-1">
        {categories.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </div>
  );
};

export default CategoryTree;
