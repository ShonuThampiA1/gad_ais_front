'use client';

import React, { useState, ReactNode, useEffect } from 'react';
import {
  Disclosure,
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from '@headlessui/react';
import { BellIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { AccessibilityToolbar } from '../../components/accessibility';
import { ThemeToggle } from '../../components/theme-toggle';
import { Footer } from '../../components/footer';
import { ThemeProvider } from 'next-themes';
import DashboardNavigation from '../dashboard-navigation';
import UserNav from '../user-nav';
import ChangePasswordModal from '@/app/(auth)/change-password/change-password-modal';
import ChangeCredentialModal from '@/app/(auth)/change-credential/change-credential-modal';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const router = useRouter();
  const [role, setRole] = useState<number | null>(null);
  const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
  const [isChangeCredentialModalOpen, setChangeCredentialModalOpen] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(false);
  const [isPasswordExpired, setIsPasswordExpired] = useState(false);

  useEffect(() => {
    const storedRole = Number(sessionStorage.getItem('role_id'));
    setRole(storedRole);

    const firstLogin = sessionStorage.getItem('is_first_login') === 'true';
    const passwordExpired = sessionStorage.getItem('is_password_expired') === 'true';

    setIsFirstLogin(firstLogin);
    setIsPasswordExpired(passwordExpired);

    if (firstLogin || passwordExpired) {
      setChangePasswordModalOpen(true);
    }
  }, []);

  const handleMenuAction = (action: string) => {
    if (action === 'changeCredential') {
      setChangeCredentialModalOpen(true);
    } else if (action === 'changePassword') {
      setChangePasswordModalOpen(true);
    } else if (action === 'signOut') {
      signOut();
    }
  };

  const signOut = async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (token) {
        sessionStorage.removeItem('token');
      }
      router.push('/login');
    } catch (err) {
      console.error('Error during sign-out:', err);
    }
  };

  const userNavigation = [
    { name: 'Your Profile', href: '/profile', role: [2] },
    { name: 'Settings', action: 'changeCredential' },
    { name: 'Change Password', action: 'changePassword' },
    { name: 'Sign out', action: 'signOut' },
  ];

  const handleCredentialChangeSuccess = (message: string) => {
    setChangeCredentialModalOpen(false);
    sessionStorage.clear();
    toast.success(message || 'Credential change completed successfully. Please sign in again.');
    router.push('/login');
  };

  const filteredNavigation = role !== null
    ? userNavigation.filter((item) => (item.role ? item.role.includes(role) : true))
    : [];

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return null;

  const officerDetails = {
    fullName: 'MR. JOSEP THOMAS',
    email: 'AKHIL.SS@DUK.KAC.IN',
    aisNumber: 'A1S1234067890',
    aisServiceNumber: '20253243',
    lastLogin: 'Oct 10, 2025, 11:05 AM',
    profileCompletion: '35%',
  };

  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
      <div className="min-h-screen flex flex-col">
        {/* Top Navbar */}
        <Disclosure
          as="nav"
          className="border-b border-neutral-200 bg-indigo-600 text-white dark:bg-neutral-800 dark:border-neutral-900"
        >
          {({ open }) => (
            <>
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <h1 className="text-base font-medium sm:text-lg">AIS e-Service Portal</h1>
                    <span className="block text-xs sm:text-sm">General Administration (AIS) Department</span>
                  </div>
                  <div className="flex items-center gap-3 sm:gap-4">
                    <AccessibilityToolbar />
                    <div className="sm:hidden">
                      <Disclosure.Button className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-indigo-700 focus:outline-none">
                        <span className="sr-only">Open main menu</span>
                        {open ? (
                          <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                        ) : (
                          <Bars3Icon className="h-6 w-6" aria-hidden="true" />
                        )}
                      </Disclosure.Button>
                    </div>
                    <span className="hidden text-sm md:inline">Last Login: {officerDetails.lastLogin}</span>
                    <ThemeToggle />
                  </div>
                </div>
              </div>
            </>
          )}
        </Disclosure>

        {/* Secondary Navbar with Navigation and Officer Details */}
        <Disclosure
          as="nav"
          className="border-b border-neutral-200 bg-white dark:bg-neutral-700 dark:border-neutral-800"
        >
          {({ open }) => (
            
            <>
              {open?"":""}
              <div className="mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex min-h-24 flex-col items-start justify-between gap-4 py-4 lg:flex-row lg:items-center">
                  {/* Left Side: Navigation */}
                  <div className="flex w-full items-center lg:w-auto">
                    <div className="hidden w-full sm:flex">
                      <DashboardNavigation variant="desktop" />
                    </div>
                  </div>

                  {/* Right Side: Officer Details and User Actions */}
                  <div className="flex w-full flex-col gap-4 lg:w-auto lg:flex-row lg:items-center lg:justify-end">
                    <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:space-x-4">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-200 sm:h-16 sm:w-16">
                          <span className="text-2xl">👤</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium">Complete: {officerDetails.profileCompletion}</p>
                          <button className="mt-1 rounded bg-indigo-600 px-3 py-2 text-sm text-white">Profile Preview</button>
                        </div>
                      </div>
                      <div className="mt-2 text-sm sm:mt-0">
                        <h3 className="text-sm font-semibold">Officer Details</h3>
                        <div className="flex flex-col space-y-1 text-sm">
                          <p>Full Name: {officerDetails.fullName}</p>
                          <p>Email Address: {officerDetails.email}</p>
                          <p>AIS Number: {officerDetails.aisNumber}</p>
                          <p>AIS e-Service N.: {officerDetails.aisServiceNumber}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 self-end lg:self-auto">
                      <UserNav />
                      <button className="p-1 text-gray-500 hover:text-gray-400">
                        <BellIcon className="h-6 w-6" aria-hidden="true" />
                      </button>
                      <Menu as="div" className="relative">
                        <MenuButton className="flex items-center text-sm focus:outline-none">
                          <Image
                            alt=""
                            src="/images/user.png"
                            className="h-8 w-8 rounded-full"
                            width={32}
                            height={32}
                          />
                        </MenuButton>
                        <MenuItems className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black/5">
                          {filteredNavigation.map((item) =>
                            item.action ? (
                              <MenuItem key={item.name}>
                                <button
                                  onClick={() => handleMenuAction(item.action)}
                                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {item.name}
                                </button>
                              </MenuItem>
                            ) : (
                              <MenuItem key={item.name}>
                                <Link
                                  href={item.href ?? '#'}
                                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                  {item.name}
                                </Link>
                              </MenuItem>
                            )
                          )}
                        </MenuItems>
                      </Menu>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Navigation Panel */}
              <Disclosure.Panel className="sm:hidden bg-white">
                <div className="space-y-2 px-4 py-2">
                  <DashboardNavigation variant="mobile" />
                </div>
              </Disclosure.Panel>
            </>
          )}
        </Disclosure>

        {/* Main Content */}
        <main className="flex-grow bg-gray-50 dark:bg-neutral-800 dark:text-white">
          <div className="mx-auto px-4 sm:px-6 lg:px-8 py-6">{children}</div>
        </main>
        <Footer />

        {isChangePasswordModalOpen && (
          <ChangePasswordModal
            closeModal={() => setChangePasswordModalOpen(false)}
            isFirstLogin={isFirstLogin}
            isPasswordExpired={isPasswordExpired}
          />
        )}

        {isChangeCredentialModalOpen && (
          <ChangeCredentialModal
            closeModal={() => setChangeCredentialModalOpen(false)}
            onSuccessLogout={handleCredentialChangeSuccess}
          />
        )}
      </div>
    </ThemeProvider>
  );
}
