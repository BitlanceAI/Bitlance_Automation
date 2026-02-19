import { CookieBanner } from "@/components/ui/cookie-banner";

export default function CookieDemoPage() {
    return (
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground p-8">
            <div className="text-center max-w-md">
                <h1 className="text-3xl font-bold mb-4">Cookie Banner Demo</h1>

                <p className="mb-6 text-muted-foreground">
                    This is a demo page showing how the cookie banner works.
                </p>

                <CookieBanner />
            </div>
        </main>
    );
}
