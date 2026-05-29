"use client";

import { createTRPCReact } from "@trpc/react-query";
import type { AppRouter } from "@program/api";

export const trpc = createTRPCReact<AppRouter>();
