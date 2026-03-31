"use client";

import Link from "next/link";
import type React from "react";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

type CommonProps = {
  children: React.ReactNode;
  className?: string;
  fullWidth?: boolean;
  loading?: boolean;
};

type ButtonProps = CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: never;
  };

type LinkProps = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    href: string;
  };

export type AppButtonProps = ButtonProps | LinkProps;

const buttonClasses =
  "inline-flex min-h-12 items-center justify-center rounded-xl border border-black bg-black px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:border-neutral-300 disabled:bg-neutral-200 disabled:text-neutral-500";

const AppButton = forwardRef<HTMLButtonElement | HTMLAnchorElement, AppButtonProps>(
  function AppButton(props, ref) {
    const { children, className, fullWidth = false, loading = false, ...rest } = props;
    const classes = cn(buttonClasses, fullWidth && "w-full", className);

    if ("href" in props) {
      const { href, ...linkProps } = rest as LinkProps;

      return (
        <Link
          href={href}
          className={classes}
          ref={ref as React.Ref<HTMLAnchorElement>}
          {...linkProps}
        >
          {children}
        </Link>
      );
    }

    const buttonProps = rest as ButtonProps;

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        className={classes}
        {...buttonProps}
      >
        {loading ? "Please wait..." : children}
      </button>
    );
  },
);

export default AppButton;
