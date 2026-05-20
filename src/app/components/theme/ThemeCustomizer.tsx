'use client';

import React, { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon, PaintBrushIcon } from '@heroicons/react/24/outline';
import { useThemeStore } from '@/lib/theme/themeStore';

export function ThemeCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const {
    primaryColor,
    borderRadius,
    borderWidth,
    fontFamily,
    fontWeight,
    setPrimaryColor,
    setBorderRadius,
    setBorderWidth,
    setFontFamily,
    setFontWeight,
    resetTheme,
  } = useThemeStore();

  const colorOptions = [
    { name: 'Indigo (Default)', value: '#1e40af' },
    { name: 'Emerald', value: '#047857' },
    { name: 'Rose', value: '#be123c' },
    { name: 'Amber', value: '#b45309' },
    { name: 'Teal', value: '#0369a1' },
    { name: 'Purple', value: '#6d28d9' },
  ];

  const radiusOptions = [
    { name: 'Square', value: '0px' },
    { name: 'Small', value: '0.25rem' },
    { name: 'Medium (Default)', value: '0.5rem' },
    { name: 'Large', value: '1rem' },
    { name: 'Full', value: '9999px' },
  ];

  const borderOptions = [
    { name: 'None', value: '0px' },
    { name: 'Thin (Default)', value: '1px' },
    { name: 'Medium', value: '2px' },
    { name: 'Thick', value: '4px' },
  ];

  const fontOptions = [
    { name: 'Inter (Default)', value: 'Inter, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: '"Open Sans", sans-serif' },
    { name: 'System UI', value: 'system-ui, -apple-system, sans-serif' },
  ];

  const weightOptions = [
    { name: 'Light', value: '300' },
    { name: 'Normal (Default)', value: '400' },
    { name: 'Medium', value: '500' },
    { name: 'Semi Bold', value: '600' },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-neutral-700 dark:hover:text-white transition-colors"
        aria-label="Customize Theme"
      >
        <PaintBrushIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      <Transition show={isOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-[100]" onClose={setIsOpen}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-in-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25 transition-opacity" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={React.Fragment}
                  enter="transform transition ease-in-out duration-300 sm:duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300 sm:duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-sm">
                    <div className="flex h-full flex-col overflow-y-scroll bg-white dark:bg-neutral-900 shadow-xl border-l border-gray-200 dark:border-neutral-800">
                      <div className="px-4 py-6 sm:px-6 border-b border-gray-200 dark:border-neutral-800 bg-gray-50 dark:bg-neutral-800/50 flex items-start justify-between">
                        <div>
                          <Dialog.Title className="text-lg font-semibold leading-6 text-gray-900 dark:text-white">
                            Theme Customizer
                          </Dialog.Title>
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                            Personalize the portal appearance to your liking.
                          </p>
                        </div>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="relative flex-1 px-4 py-6 sm:px-6 space-y-8">
                        {/* Primary Color */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Primary Color</h3>
                          <div className="grid grid-cols-6 gap-3">
                            {colorOptions.map((color) => (
                              <button
                                key={color.value}
                                onClick={() => setPrimaryColor(color.value)}
                                className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-transform hover:scale-110 ${
                                  primaryColor === color.value ? 'border-gray-900 dark:border-white ring-2 ring-offset-1 ring-gray-400' : 'border-transparent'
                                }`}
                                style={{ backgroundColor: color.value }}
                                title={color.name}
                              />
                            ))}
                          </div>
                          <div className="mt-3 flex items-center gap-3">
                             <input
                               type="color"
                               value={primaryColor}
                               onChange={(e) => setPrimaryColor(e.target.value)}
                               className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                             />
                             <span className="text-xs text-gray-500">Custom hex</span>
                          </div>
                        </div>

                        {/* Border Radius */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Border Radius</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {radiusOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => setBorderRadius(option.value)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                  borderRadius === option.value
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800'
                                }`}
                                style={{ borderRadius: option.value }}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Border Thickness */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Border Thickness</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {borderOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => setBorderWidth(option.value)}
                                className={`px-3 py-2 text-sm border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 transition-colors ${
                                  borderWidth === option.value ? 'bg-gray-100 dark:bg-neutral-800 font-semibold' : 'hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                                style={{ borderWidth: option.value, borderStyle: 'solid' }}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Font Family */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Font Family</h3>
                          <div className="grid grid-cols-1 gap-2">
                            {fontOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => setFontFamily(option.value)}
                                className={`px-3 py-2 text-sm border rounded-md text-left transition-colors ${
                                  fontFamily === option.value
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800'
                                }`}
                                style={{ fontFamily: option.value }}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>

                        {/* Font Weight */}
                        <div>
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-3">Font Weight (Base)</h3>
                          <div className="grid grid-cols-2 gap-2">
                            {weightOptions.map((option) => (
                              <button
                                key={option.value}
                                onClick={() => setFontWeight(option.value)}
                                className={`px-3 py-2 text-sm border rounded-md transition-colors ${
                                  fontWeight === option.value
                                    ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300'
                                    : 'border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-neutral-700 dark:text-gray-300 dark:hover:bg-neutral-800'
                                }`}
                                style={{ fontWeight: option.value }}
                              >
                                {option.name}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Footer Actions */}
                      <div className="border-t border-gray-200 dark:border-neutral-800 p-4 bg-gray-50 dark:bg-neutral-800/50">
                        <button
                          onClick={resetTheme}
                          className="w-full rounded-md bg-white dark:bg-neutral-800 px-3 py-2 text-sm font-semibold text-gray-900 dark:text-white shadow-sm ring-1 ring-inset ring-gray-300 dark:ring-neutral-700 hover:bg-gray-50 dark:hover:bg-neutral-700 transition-colors"
                        >
                          Reset to Defaults
                        </button>
                      </div>

                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}