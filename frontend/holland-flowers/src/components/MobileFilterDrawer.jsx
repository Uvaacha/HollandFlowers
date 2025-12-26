import React from 'react';
import './MobileFilterDrawer.css';

/**
 * MobileFilterDrawer - Reusable mobile filter drawer/panel
 * 
 * Usage:
 * <MobileFilterDrawer
 *   isOpen={mobileFilterOpen}
 *   onClose={() => setMobileFilterOpen(false)}
 *   currentLang="en"
 *   onClearAll={clearAllFilters}
 *   showClearAll={hasActiveFilters}
 *   title="Filters"
 *   applyLabel="Apply"
 *   clearLabel="Clear All"
 *   itemCount={12}
 * >
 *   {children} - Your filter sections go here
 * </MobileFilterDrawer>
 */

const MobileFilterDrawer = ({
  isOpen,
  onClose,
  currentLang = 'en',
  onClearAll,
  showClearAll = false,
  title,
  applyLabel,
  clearLabel,
  itemCount,
  children
}) => {
  const t = {
    filters: currentLang === 'ar' ? 'التصفية' : 'Filters',
    apply: currentLang === 'ar' ? 'تطبيق' : 'Apply',
    clearAll: currentLang === 'ar' ? 'مسح الكل' : 'Clear All',
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-filter-drawer__overlay" onClick={onClose}>
      <div 
        className={`mobile-filter-drawer ${currentLang === 'ar' ? 'rtl' : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="mobile-filter-drawer__header">
          <h3>{title || t.filters}</h3>
          <button 
            className="mobile-filter-drawer__close-btn"
            onClick={onClose}
            aria-label="Close filters"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>
        
        {/* Content - Filter sections go here */}
        <div className="mobile-filter-drawer__content">
          {children}
        </div>
        
        {/* Footer */}
        <div className="mobile-filter-drawer__footer">
          <button 
            className="mobile-filter-drawer__clear-btn"
            onClick={onClearAll}
          >
            {clearLabel || t.clearAll}
          </button>
          <button 
            className="mobile-filter-drawer__apply-btn"
            onClick={onClose}
          >
            {applyLabel || t.apply}
            {itemCount !== undefined && ` (${itemCount})`}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * FilterSection - Collapsible filter section
 */
export const FilterSection = ({ 
  title, 
  isOpen = true, 
  onToggle, 
  children 
}) => {
  return (
    <div className="mobile-filter-drawer__section">
      <button 
        className="mobile-filter-drawer__section-header"
        onClick={onToggle}
      >
        <span>{title}</span>
        <svg 
          className={`mobile-filter-drawer__chevron ${isOpen ? 'open' : ''}`}
          width="16" 
          height="16" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2"
        >
          <path d="M6 9l6 6 6-6"/>
        </svg>
      </button>
      {isOpen && (
        <div className="mobile-filter-drawer__section-content">
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * PriceRangeFilter - Price range input
 */
export const PriceRangeFilter = ({
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  currency = 'KD',
  minPlaceholder = 'Min',
  maxPlaceholder = 'Max',
  highestPriceLabel,
  highestPrice
}) => {
  return (
    <div className="mobile-filter-drawer__price-filter">
      <div className="mobile-filter-drawer__price-inputs">
        <div className="mobile-filter-drawer__price-input-group">
          <span className="mobile-filter-drawer__currency">{currency}</span>
          <input
            type="number"
            placeholder={minPlaceholder}
            value={minValue}
            onChange={(e) => onMinChange(e.target.value)}
            min="0"
          />
        </div>
        <span className="mobile-filter-drawer__price-separator">-</span>
        <div className="mobile-filter-drawer__price-input-group">
          <span className="mobile-filter-drawer__currency">{currency}</span>
          <input
            type="number"
            placeholder={maxPlaceholder}
            value={maxValue}
            onChange={(e) => onMaxChange(e.target.value)}
            min="0"
          />
        </div>
      </div>
      {highestPrice !== undefined && (
        <p className="mobile-filter-drawer__price-hint">
          {highestPriceLabel} {highestPrice} {currency}
        </p>
      )}
    </div>
  );
};

/**
 * CheckboxFilter - Checkbox list filter
 */
export const CheckboxFilter = ({
  options,
  selectedValues = [],
  onChange,
  currentLang = 'en'
}) => {
  const handleChange = (value) => {
    if (selectedValues.includes(value)) {
      onChange(selectedValues.filter(v => v !== value));
    } else {
      onChange([...selectedValues, value]);
    }
  };

  return (
    <div className="mobile-filter-drawer__checkbox-list">
      {options.map(option => {
        const label = currentLang === 'ar' ? (option.labelAr || option.label) : (option.labelEn || option.label);
        const value = option.value || option.id;
        const isChecked = selectedValues.includes(value);
        
        return (
          <label key={value} className="mobile-filter-drawer__checkbox-item">
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => handleChange(value)}
            />
            <span className={`mobile-filter-drawer__checkmark ${isChecked ? 'checked' : ''}`}></span>
            <span className="mobile-filter-drawer__checkbox-label">{label}</span>
          </label>
        );
      })}
    </div>
  );
};

export default MobileFilterDrawer;
