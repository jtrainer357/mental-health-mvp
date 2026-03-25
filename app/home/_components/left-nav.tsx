"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Home, Users, Calendar, MessageSquare, CreditCard, TrendingUp, LogOut } from "lucide-react";
import { LeftNav as LeftNavBase, NavItem } from "@/design-system/components/ui/left-nav";
import { cn } from "@/design-system/lib/utils";
import type { AuthSession } from "@/src/lib/auth/types";

type ActivePage = "home" | "patients" | "schedule" | "messages" | "billing" | "marketing";

interface LeftNavProps {
  activePage?: ActivePage;
}

function getNavItems(activePage: ActivePage = "home"): NavItem[] {
  return [
    { icon: Home, label: "Home", active: activePage === "home", href: "/home" },
    { icon: Users, label: "Patients", active: activePage === "patients", href: "/home/patients" },
    {
      icon: Calendar,
      label: "Schedule",
      active: activePage === "schedule",
      href: "/home/schedule",
    },
    {
      icon: MessageSquare,
      label: "Communications",
      active: activePage === "messages",
      href: "/home/communications",
    },
    {
      icon: CreditCard,
      label: "Billing",
      active: activePage === "billing",
      href: "/home/billing",
    },
    {
      icon: TrendingUp,
      label: "Marketing",
      active: activePage === "marketing",
      href: "/home/marketing",
    },
  ];
}

function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  const first = parts[0];
  const last = parts[parts.length - 1];
  if (parts.length >= 2 && first && last && first.length > 0 && last.length > 0) {
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

function UserMenu({
  isOpen,
  onClose,
  userName,
  userEmail,
}: {
  isOpen: boolean;
  onClose: () => void;
  userName: string;
  userEmail: string;
}) {
  const router = useRouter();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login");
  };

  if (!isOpen) return null;

  return (
    <div
      ref={menuRef}
      className={cn(
        "absolute z-50 w-56 rounded-xl border bg-white py-2 shadow-lg",
        // Desktop: position to the right of the avatar
        "lg:bottom-2 lg:left-full lg:ml-3",
        // Mobile: position above the bottom nav
        "bottom-full left-1/2 mb-3 -translate-x-1/2 lg:translate-x-0"
      )}
    >
      {/* User info header */}
      <div className="border-b px-4 py-3">
        <p className="text-sm font-medium text-gray-900">{userName}</p>
        <p className="truncate text-xs text-gray-500">{userEmail}</p>
      </div>

      {/* Logout */}
      <div className="border-t py-1">
        <button
          onClick={handleLogout}
          className="flex min-h-[44px] w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}

export function LeftNav({ activePage = "home" }: LeftNavProps) {
  const { data: sessionData } = useSession();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Cast to AuthSession for custom user properties
  const session = sessionData as AuthSession | null;

  // Get user data from session or use fallback
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userAvatar =
    session?.user?.avatarUrl ||
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face";
  const userInitials = getInitials(userName);

  return (
    <div className="relative">
      <LeftNavBase
        logo={{
          src: "/tebra-logo.svg",
          alt: "Tebra Mental Health",
          width: 96,
          height: 23,
        }}
        items={getNavItems(activePage)}
        showNotifications={true}
        user={{
          initials: userInitials,
          name: userName,
          avatarSrc: userAvatar,
          onClick: () => setShowUserMenu(!showUserMenu),
        }}
        isHomePage={activePage === "home"}
      />

      {/* User menu dropdown */}
      <UserMenu
        isOpen={showUserMenu}
        onClose={() => setShowUserMenu(false)}
        userName={userName}
        userEmail={userEmail}
      />
    </div>
  );
}
