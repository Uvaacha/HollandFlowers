import React, { useState } from 'react';
import './MobileFilterBar.css';

/**
 * MobileFilterBar - Reusable mobile filter/sort toolbar
 * 
 * Usage:
 * <MobileFilterBar
 *   currentLang="en"
 *   onFilterClick={() => setMobileFilterOpen(true)}
 *   sortBy={sortBy}
 *   onSortChange={(value) => setSortBy(value)}
 *   sortOptions={[
 *     { value: 'default', labelEn: 'Default', labelAr: 'افتراضي' },
 *     { value: 'price-low', labelEn: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
 *   ]}
 *   filterCount={2} // optional - shows badge with active filter count
 * />
 */

const MobileFilterBar = ({
  currentLang = 'en',
  onFilterClick,
  sortBy,
  onSortChange,
  sortOptions = [],
  filterCount = 0,
  filterLabel,
  sortLabel
}) => {
  const [sortDrawerOpen, setSortDrawerOpen] = useState(false);

  const defaultSortOptions = [
    { value: 'default', labelEn: 'Default', labelAr: 'افتراضي' },
    { value: 'price-low', labelEn: 'Price: Low to High', labelAr: 'السعر: من الأقل للأعلى' },
    { value: 'price-high', labelEn: 'Price: High to Low', labelAr: 'السعر: من الأعلى للأقل' },
    { value: 'newest', labelEn: 'Newest First', labelAr: 'الأحدث أولاً' },
    { value: 'name', labelEn: 'Name: A-Z', labelAr: 'الاسم: أ-ي' },
  ];

  const options = sortOptions.length > 0 ? sortOptions : defaultSortOptions;
  
  const t = {
    filter: currentLang === 'ar' ? 'تصفية' : 'Filter',
    sort: currentLang === 'ar' ? 'ترتيب' : 'Sort',
    sortBy: currentLang === 'ar' ? 'ترتيب حسب' : 'Sort by',
  };

  const handleSortSelect = (value) => {
    onSortChange(value);
    setSortDrawerOpen(false);
  };

  const getOptionLabel = (option) => {
    return currentLang === 'ar' ? option.labelAr : option.labelEn;
  };

  const getCurrentSortLabel = () => {
    const current = options.find(opt => opt.value === sortBy);
    return current ? getOptionLabel(current) : t.sort;
  };

  return (
    <>
      {/* Mobile Filter/Sort Toolbar */}
      <div className={`mobile-filter-bar ${currentLang === 'ar' ? 'rtl' : ''}`}>
        <button 
          className="mobile-filter-bar__filter-btn"
          onClick={onFilterClick}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="16" y2="12"/>
            <line x1="4" y1="18" x2="12" y2="18"/>
          </svg>
          <span>{filterLabel || t.filter}</span>
          {filterCount > 0 && (
            <span className="mobile-filter-bar__badge">{filterCount}</span>
          )}
        </button>
        
        <button 
          className="mobile-filter-bar__sort-btn"
          onClick={() => setSortDrawerOpen(true)}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M6 12h12M9 18h6"/>
          </svg>
          <span>{sortLabel || t.sort}</span>
        </button>
      </div>

      {/* Sort Drawer Overlay */}
      {sortDrawerOpen && (
        <div className="mobile-filter-bar__overlay" onClick={() => setSortDrawerOpen(false)}>
          <div 
            className={`mobile-filter-bar__drawer ${currentLang === 'ar' ? 'rtl' : ''}`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mobile-filter-bar__drawer-header">
              <h3>{t.sortBy}</h3>
              <button 
                className="mobile-filter-bar__close-btn"
                onClick={() => setSortDrawerOpen(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 6L6 18M6 6l12 12"/>
                </svg>
              </button>
            </div>
            
            <div className="mobile-filter-bar__drawer-content">
              <div className="mobile-filter-bar__sort-options">
                {options.map(option => (
                  <button
                    key={option.value}
                    className={`mobile-filter-bar__sort-option ${sortBy === option.value ? 'active' : ''}`}
                    onClick={() => handleSortSelect(option.value)}
                  >
                    <span>{getOptionLabel(option)}</span>
                    {sortBy === option.value && (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileFilterBar;
