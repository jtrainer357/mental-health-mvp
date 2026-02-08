"use client";
import * as React from "react";
import { Home, Users, Calendar, MessageSquare, CreditCard, TrendingUp, LogOut } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { LeftNav as LeftNavBase, NavItem } from "@/design-system/components/ui/left-nav";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/design-system/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";

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

/**
 * Generate initials from a user's name.
 * Takes first letter of first name and first letter of last name.
 */
function getInitials(name?: string | null): string {
  if (!name) return "U";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) {
    return parts[0].charAt(0).toUpperCase();
  }
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function LeftNav({ activePage = "home" }: LeftNavProps) {
  const { data: session, status } = useSession();

  // Get user info from session or use fallback
  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userImage = session?.user?.image || undefined;
  const userInitials = getInitials(session?.user?.name);

  const handleLogout = () => {
    signOut({ callbackUrl: "/login" });
  };

  return (
    <div className="relative">
      {/* Main navigation - render without user prop so we can add our own dropdown */}
      <LeftNavBase
        logo={{
          src: "/tebra-logo.svg",
          alt: "Tebra Mental Health",
          width: 96,
          height: 23,
        }}
        items={getNavItems(activePage)}
        showNotifications={true}
        isHomePage={activePage === "home"}
        // Don't pass user prop - we'll render our own dropdown below
      />

      {/* Session-aware user dropdown - positioned at bottom of desktop nav */}
      <div className="pointer-events-auto fixed bottom-[60px] left-0 z-50 hidden w-36 flex-col items-center lg:flex">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar
              className="border-selected-border h-12 w-12 cursor-pointer rounded-full border-[0.5px] transition-all hover:ring-2 hover:ring-teal-dark/20"
              aria-label="User menu"
            >
              {userImage && <AvatarImage src={userImage} alt={userName} />}
              <AvatarFallback className="bg-muted text-xs font-bold">
                {status === "loading" ? "..." : userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" side="right" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                {userEmail && (
                  <p className="text-muted-foreground text-xs leading-none">
                    {userEmail}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile user avatar - positioned in bottom nav area */}
      <div className="pointer-events-auto fixed right-4 bottom-3 z-50 lg:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar
              className="border-selected-border h-11 w-11 cursor-pointer rounded-full border-[0.5px] transition-all hover:ring-2 hover:ring-teal-dark/20"
              aria-label="User menu"
            >
              {userImage && <AvatarImage src={userImage} alt={userName} />}
              <AvatarFallback className="bg-muted text-xs font-bold">
                {status === "loading" ? "..." : userInitials}
              </AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" side="top" className="w-56">
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userName}</p>
                {userEmail && (
                  <p className="text-muted-foreground text-xs leading-none">
                    {userEmail}
                  </p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleLogout}
              className="text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut className="mr-2 h-4 w-4" />
              <span>Log out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
