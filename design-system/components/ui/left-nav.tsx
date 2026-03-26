"use client";
import * as React from "react";
import { LucideIcon, Bell, User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/design-system/lib/utils";
import { Button } from "@/design-system/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/design-system/components/ui/avatar";

export interface NavItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  active?: boolean;
  onClick?: () => void;
}

export interface LogoConfig {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
}

export interface UserConfig {
  name?: string;
  initials: string;
  avatarSrc?: string;
  onClick?: () => void;
}

export interface LeftNavProps {
  logo: LogoConfig;
  items: NavItem[];
  showNotifications?: boolean;
  onNotificationsClick?: () => void;
  notificationCount?: number;
  user?: UserConfig;
  className?: string;
  isHomePage?: boolean;
}

export function LeftNav({
  logo,
  items,
  showNotifications = true,
  onNotificationsClick,
  notificationCount,
  user,
  className,
  isHomePage = false,
}: LeftNavProps) {
  return (
    <>
      {/* Desktop Side Nav */}
      <aside
        role="navigation"
        aria-label="Main navigation"
        className={cn(
          "pointer-events-auto fixed top-0 left-0 z-40 hidden h-screen w-36 flex-col items-center pt-6 pb-4 lg:flex",
          className
        )}
      >
        {/* Logo — always links to home */}
        <Link
          href="/home"
          prefetch={true}
          className="mb-6 cursor-pointer px-4 transition-opacity hover:opacity-80"
        >
          <Image
            src={logo.src}
            alt={logo.alt || "Logo"}
            width={logo.width || 96}
            height={logo.height || 23}
          />
        </Link>

        {/* Main Nav Icons */}
        <nav className="-mt-20 flex flex-1 flex-col items-center justify-center gap-10">
          {items.map((item, index) => {
            const buttonContent = (
              <>
                <item.icon className="h-6 w-6" />
                <span className="sr-only">{item.label}</span>
              </>
            );
            const buttonClassName = cn(
              "h-12 w-12 rounded-full border-[0.5px] border-selected-border text-teal-dark transition-all hover:bg-white/50",
              item.active &&
                "border-0 bg-teal-dark text-white shadow-xl hover:bg-teal-dark hover:text-white"
            );

            if (item.href) {
              return (
                <Button key={index} variant="ghost" size="icon" asChild className={buttonClassName}>
                  <Link href={item.href} prefetch={true}>
                    {buttonContent}
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={item.onClick}
                className={buttonClassName}
              >
                {buttonContent}
              </Button>
            );
          })}
        </nav>

        {/* Bottom Icons */}
        <div className="mt-auto mb-[60px] flex flex-col items-center gap-6">
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onNotificationsClick}
              className="border-selected-border text-teal-dark relative h-12 w-12 rounded-full border-[0.5px] hover:bg-white/50"
            >
              <Bell className="h-6 w-6" />
              {notificationCount && notificationCount > 0 && (
                <span className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full text-xs">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          )}
          {user && (
            <Avatar
              className="border-selected-border h-12 w-12 cursor-pointer rounded-full border-[0.5px] transition-all hover:bg-white/50"
              onClick={user.onClick}
              onKeyDown={(e) => {
                if ((e.key === "Enter" || e.key === " ") && user.onClick) {
                  e.preventDefault();
                  user.onClick();
                }
              }}
              tabIndex={0}
              role="button"
              aria-label={user.name ? `${user.name} profile` : "User profile"}
            >
              {user.avatarSrc && <AvatarImage src={user.avatarSrc} alt={user.name} />}
              <AvatarFallback className="bg-muted text-xs font-bold">
                {user.initials}
              </AvatarFallback>
            </Avatar>
          )}
        </div>
      </aside>

      {/* Tablet/Mobile Bottom Nav - excludes Communications (moved to header) */}
      <nav
        role="navigation"
        aria-label="Mobile navigation"
        className="bg-card/95 safe-area-pb pointer-events-auto fixed right-0 bottom-0 left-0 z-40 flex items-center justify-around border-t px-4 py-3 backdrop-blur-sm lg:hidden"
      >
        {items
          .filter((item) => item.label !== "Communications")
          .map((item, index) => {
            const mobileButtonContent = (
              <>
                <item.icon className="h-5 w-5" />
                <span className="sr-only">{item.label}</span>
              </>
            );
            const mobileButtonClassName = cn(
              "h-11 w-11 rounded-full border-[0.5px] border-selected-border text-teal-dark transition-all hover:bg-white/50",
              item.active &&
                "border-0 bg-teal-dark text-white shadow-xl hover:bg-teal-dark hover:text-white"
            );

            if (item.href) {
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="icon"
                  asChild
                  className={mobileButtonClassName}
                >
                  <Link href={item.href} prefetch={true}>
                    {mobileButtonContent}
                  </Link>
                </Button>
              );
            }

            return (
              <Button
                key={index}
                variant="ghost"
                size="icon"
                onClick={item.onClick}
                className={mobileButtonClassName}
              >
                {mobileButtonContent}
              </Button>
            );
          })}
        {/* User profile icon */}
        {user && (
          <Button
            variant="ghost"
            size="icon"
            onClick={user.onClick}
            className="border-selected-border text-teal-dark h-11 w-11 rounded-full border-[0.5px] transition-all hover:bg-white/50"
            aria-label={user.name ? `${user.name} profile` : "User profile"}
          >
            <User className="h-5 w-5" />
            <span className="sr-only">Profile</span>
          </Button>
        )}
      </nav>
    </>
  );
}
