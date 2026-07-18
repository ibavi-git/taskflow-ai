import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const statusColors = {
  BACKLOG: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  TODO: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  IN_PROGRESS: "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20",
  TESTING: "bg-purple-500/10 text-purple-500 hover:bg-purple-500/20",
  DONE: "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20",
};

export const priorityColors = {
  LOW: "bg-gray-500/10 text-gray-500 hover:bg-gray-500/20",
  MEDIUM: "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20",
  HIGH: "bg-orange-500/10 text-orange-500 hover:bg-orange-500/20",
  URGENT: "bg-red-500/10 text-red-500 hover:bg-red-500/20",
};

export function getInitials(name) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();
}
