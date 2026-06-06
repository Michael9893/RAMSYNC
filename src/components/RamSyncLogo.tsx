import React from "react";
// @ts-ignore
import logoImg from "../assets/images/ramsync_logo_1780718399967.png";

interface LogoProps {
  className?: string;
  size?: number;
}

export function RamSyncLogo({ className = "", size = 48 }: LogoProps) {
  return (
    <img
      src={logoImg}
      alt="RAMSync Official Logo"
      width={size}
      height={size}
      className={`${className} shrink-0 object-contain rounded-xl`}
      style={{ width: size, height: size }}
      referrerPolicy="no-referrer"
    />
  );
}
