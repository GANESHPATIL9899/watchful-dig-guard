import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-mono text-7xl font-bold text-primary">404</h1>
        <h2 className="mt-4 text-xl font-semibold">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <a href="/" className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90">
          Back to dashboard
        </a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Site Safety Hub — Excavator Blind-Spot Monitoring" },
      { name: "description", content: "Real-time AI safety monitoring for construction sites — detect workers in excavator blind spots, track incidents, prevent accidents." },
      { property: "og:title", content: "Site Safety Hub" },
      { property: "og:description", content: "AI-powered blind-spot safety monitoring for construction excavators." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('error', function(event) {
                console.error("Caught global error:", event.error);
                var errDiv = document.createElement('div');
                errDiv.style.position = 'fixed';
                errDiv.style.top = '0';
                errDiv.style.left = '0';
                errDiv.style.width = '100%';
                errDiv.style.height = '100%';
                errDiv.style.backgroundColor = '#f8fafc';
                errDiv.style.color = '#0f172a';
                errDiv.style.padding = '30px';
                errDiv.style.zIndex = '999999';
                errDiv.style.fontFamily = 'monospace';
                errDiv.style.overflow = 'auto';
                errDiv.style.whiteSpace = 'pre-wrap';
                errDiv.innerHTML = '<h1 style="color: #e11d48; margin-top: 0; font-size: 20px;">⚠️ Client-Side Javascript Error Detected</h1>' +
                  '<p><strong>Message:</strong> ' + event.message + '</p>' +
                  '<p><strong>Filename:</strong> ' + event.filename + ':' + event.lineno + ':' + event.colno + '</p>' +
                  '<pre style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 10px;">' + (event.error ? event.error.stack : 'No stack trace available') + '</pre>';
                document.body.appendChild(errDiv);
              });
              window.addEventListener('unhandledrejection', function(event) {
                console.error("Caught unhandled rejection:", event.reason);
                var errDiv = document.createElement('div');
                errDiv.style.position = 'fixed';
                errDiv.style.top = '0';
                errDiv.style.left = '0';
                errDiv.style.width = '100%';
                errDiv.style.height = '100%';
                errDiv.style.backgroundColor = '#f8fafc';
                errDiv.style.color = '#0f172a';
                errDiv.style.padding = '30px';
                errDiv.style.zIndex = '999999';
                errDiv.style.fontFamily = 'monospace';
                errDiv.style.overflow = 'auto';
                errDiv.style.whiteSpace = 'pre-wrap';
                errDiv.innerHTML = '<h1 style="color: #e11d48; margin-top: 0; font-size: 20px;">⚠️ Unhandled Promise Rejection</h1>' +
                  '<p><strong>Reason:</strong> ' + String(event.reason) + '</p>' +
                  '<pre style="background-color: #f1f5f9; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; margin-top: 10px;">' + (event.reason && event.reason.stack ? event.reason.stack : 'No stack trace available') + '</pre>';
                document.body.appendChild(errDiv);
              });
            `
          }}
        />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
      <Toaster richColors position="top-right" />
    </QueryClientProvider>
  );
}
