import { NotFound } from "@/src/components/error";

/**
 * Next.js 404 Not Found page
 * Displayed when a route is not found in the application
 */
export default function NotFoundPage() {
  return <NotFound className="min-h-screen" />;
}
