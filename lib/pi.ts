// Pi identity is managed by contexts/pi-auth-context.tsx.
// This type alias remains for older components that import PiUser.
import type { PiAuthResult } from "@/lib/sdklite-types";
export type PiUser = PiAuthResult["user"];
