'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDownIcon } from '@heroicons/react/24/solid';

export function SearchableSelect({
  id,
  name,
  value,
  onChange,
  options = [],
  placeholder = 'Select',
  disabled = false,
  className = '',
  menuClassName = '',
  searchPlaceholder = 'Search...',
  getOptionLabel,
  getOptionValue,
  allowEmptyOption = true,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [openUpward, setOpenUpward] = useState(false);
  const [menuMaxHeight, setMenuMaxHeight] = useState(224);
  const [menuStyle, setMenuStyle] = useState({});
  const [isMounted, setIsMounted] = useState(false);
  const containerRef = useRef(null);
  const menuRef = useRef(null);

  const updateMenuPlacement = () => {
    if (!containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom - 12;
    const spaceAbove = rect.top - 12;
    const shouldOpenUpward = spaceBelow < 220 && spaceAbove > spaceBelow;
    const maxAllowedWidth = Math.max(220, viewportWidth - 24);
    const desiredWidth = Math.min(rect.width, maxAllowedWidth);

    let horizontalOffset = 0;
    const overflowRight = rect.left + desiredWidth - (viewportWidth - 12);
    if (overflowRight > 0) {
      horizontalOffset -= overflowRight;
    }
    if (rect.left + horizontalOffset < 12) {
      horizontalOffset += 12 - (rect.left + horizontalOffset);
    }

    setOpenUpward(shouldOpenUpward);
    setMenuMaxHeight(Math.max(140, Math.min(320, shouldOpenUpward ? spaceAbove - 8 : spaceBelow - 8)));
    const nextLeft = rect.left + horizontalOffset;
    const nextTop = rect.bottom + 4;
    const nextBottom = viewportHeight - rect.top + 4;

    setMenuStyle({
      position: 'fixed',
      width: `${desiredWidth}px`,
      left: `${nextLeft}px`,
      top: shouldOpenUpward ? 'auto' : `${nextTop}px`,
      bottom: shouldOpenUpward ? `${nextBottom}px` : 'auto',
    });
  };

  const resolveLabel = (option) => {
    if (typeof getOptionLabel === 'function') return String(getOptionLabel(option) ?? '');
    if (typeof option === 'string' || typeof option === 'number') return String(option);
    return String(option?.label ?? option?.name ?? option?.value ?? '');
  };

  const resolveValue = (option) => {
    if (typeof getOptionValue === 'function') return String(getOptionValue(option) ?? '');
    if (typeof option === 'string' || typeof option === 'number') return String(option);
    return String(option?.value ?? option?.id ?? '');
  };

  const normalizedValue = value === null || value === undefined ? '' : String(value);

  const selectedOption = useMemo(
    () => options.find((option) => resolveValue(option) === normalizedValue),
    [options, normalizedValue]
  );

  const filteredOptions = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return options;
    return options.filter((option) => resolveLabel(option).toLowerCase().includes(query));
  }, [options, searchTerm]);

  const emitChange = (nextValue) => {
    if (typeof onChange === 'function') {
      onChange({ target: { name, value: nextValue } });
    }
  };

  const handleSelect = (nextValue) => {
    emitChange(nextValue);
    setIsOpen(false);
  };

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) setSearchTerm('');
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    updateMenuPlacement();

    const handleReposition = () => updateMenuPlacement();
    window.addEventListener('resize', handleReposition);
    window.addEventListener('scroll', handleReposition, true);

    return () => {
      window.removeEventListener('resize', handleReposition);
      window.removeEventListener('scroll', handleReposition, true);
    };
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const clickedTrigger = containerRef.current?.contains(event.target);
      const clickedMenu = menuRef.current?.contains(event.target);

      if (!clickedTrigger && !clickedMenu) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <button
        id={id}
        type="button"
        data-field={name}
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`mt-1 block min-h-[42px] w-full rounded-md border border-gray-300 px-3 py-2 pr-10 text-left text-sm shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-300 dark:text-white ${disabled ? 'cursor-not-allowed opacity-60' : ''} ${className}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className={`block max-w-full truncate pr-2 ${selectedOption ? 'text-gray-900 dark:text-white' : 'text-gray-400'}`}>
          {selectedOption ? resolveLabel(selectedOption) : placeholder}
        </span>
        <ChevronDownIcon className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
      </button>

      {isMounted &&
        isOpen &&
        !disabled &&
        createPortal(
          <div
            ref={menuRef}
            className={`z-[80] max-w-full overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800 ${menuClassName}`}
            style={menuStyle}
          >
            <div className="border-b border-gray-200 p-2 dark:border-gray-700">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <ul className="overflow-auto py-1" style={{ maxHeight: `${menuMaxHeight}px` }} role="listbox">
              {allowEmptyOption && (
                <li>
                  <button
                    type="button"
                    className="w-full whitespace-normal break-words px-3 py-2 text-left text-sm leading-5 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
                    onClick={() => handleSelect('')}
                  >
                    {placeholder}
                  </button>
                </li>
              )}
              {filteredOptions.length === 0 && (
                <li className="px-3 py-2 text-sm text-gray-500">No results found</li>
              )}
              {filteredOptions.map((option) => {
                const optionValue = resolveValue(option);
                const optionLabel = resolveLabel(option);
                return (
                  <li key={optionValue}>
                    <button
                      type="button"
                      className={`w-full whitespace-normal break-words px-3 py-2 text-left text-sm leading-5 hover:bg-gray-100 dark:hover:bg-gray-700 ${
                        optionValue === normalizedValue ? 'bg-gray-100 dark:bg-gray-700' : ''
                      }`}
                      onClick={() => handleSelect(optionValue)}
                    >
                      {optionLabel}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>,
          document.body
        )}
    </div>
  );
}
