"use client";

import { ReactNode, useEffect, useState } from "react";
import { HomeIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import { usePathname } from "next/navigation";

type BreadcrumbProps = {
  rightContent?: ReactNode;
};

const pathRedirects: Record<string, string> = {
  "/services": "/services/entitlement-claims",
  "/master": "/master/personal-profile",
  "/master-controls": "/master-controls/user-management",
  "/official": "/official/dashboard"
};

export function Breadcrumb({ rightContent }: BreadcrumbProps) {
  const pathname = usePathname(); // Get the current route
  const [homeLink, setHomeLink] = useState("/login");

  useEffect(() => {
    const roleId = sessionStorage.getItem("role_id");
    let dashboardPath = "/login";
    switch (roleId) {
      case "1": dashboardPath = "/add-section-officer"; break;
      case "2": dashboardPath = "/services/entitlement-claims"; break;
      case "3": dashboardPath = "/master-controls/user-management"; break;
      case "4": dashboardPath = "/official/dashboard"; break;
      case "7": dashboardPath = "/rbac"; break;
      default: dashboardPath = "/login"; break;
    }
    setHomeLink(dashboardPath);
  }, []);

  const pathSegments = pathname.split("/").filter((segment) => segment); // Remove empty segments

  // Generate breadcrumb pages from URL segments
  const breadcrumbItems = pathSegments.map((segment, index) => {
    const rawHref = "/" + pathSegments.slice(0, index + 1).join("/");
    const href = pathRedirects[rawHref] || rawHref;
    const name = decodeURIComponent(segment.replace(/-/g, " ")); // Format segment
  
    return { name, href, current: index === pathSegments.length - 1 };
  });
 
  return (
    <nav aria-label="Breadcrumb" className="my-3 w-full">
      <div className="flex w-full items-center rounded-md border bg-white px-6 dark:border-neutral-800 dark:bg-neutral-700 dark:text-white">
        <ol className="flex min-w-0 items-center space-x-4">
          {/* Home Link */}
          <li className="flex items-center">
            <Link href={homeLink} className="flex items-center text-gray-500 hover:text-gray-700 dark:text-gray-200 dark:hover:text-gray-100">
              <HomeIcon aria-hidden="true" className="size-5 shrink-0" />
              <span className="sr-only">Home</span>
            </Link>
          </li>

          {/* Dynamic Breadcrumb Items */}
          {breadcrumbItems.map((page, index) => (
            <li key={index} className="flex items-center">
              {/* Separator */}
              <svg fill="currentColor" viewBox="0 0 24 44" preserveAspectRatio="none" aria-hidden="true" className="h-full w-6 shrink-0 text-gray-200">
                <path d="M.293 0l22 22-22 22h1.414l22-22-22-22H.293z" />
              </svg>

              {/* Breadcrumb Link */}
              <Link
                href={page.current ? "#" : page.href}
                className={`ml-4 text-sm font-medium capitalize ${
                  page.current ? "text-gray-700 dark:text-gray-100" : "text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                }`}
              >
                {page.name}
              </Link>
            </li>
          ))}
        </ol>

        {rightContent && (
          <div className="ml-auto flex items-center gap-2 py-2">{rightContent}</div>
        )}
      </div>
    </nav>
  );
}
