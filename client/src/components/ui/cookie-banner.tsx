"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { requestNotificationPermission } from "@/lib/firebaseMessaging";

interface CookieBannerProps {
    message?: string;
    acceptText?: string;
    declineText?: string;
    className?: string;
    position?: "bottom" | "top";
}

const EXIT_MS = 300;

const CookieBanner = (props: CookieBannerProps) => {
    const {
        message = "We use cookies to improve your experience. By using our site, you accept cookies.",
        acceptText = "Accept",
        declineText = "Decline",
        className,
        position = "bottom",
    } = props;

    const [visible, setVisible] = useState(false);
    const [render, setRender] = useState(false);

    useEffect(() => {
        const stored =
            typeof window !== "undefined"
                ? localStorage.getItem("cookie-consent")
                : null;
        if (!stored) {
            setRender(true);
            requestAnimationFrame(() => setVisible(true));
        }
    }, []);

    const closeWithExit = () => {
        setVisible(false);
        setTimeout(() => setRender(false), EXIT_MS);
    };

    const handleAccept = async () => {
        localStorage.setItem("cookie-consent", "true");
        closeWithExit();

        // Trigger Push Permission Request
        try {
            await requestNotificationPermission();
        } catch (err) {
            console.error("Failed to request notification permission:", err);
        }
    };

    const handleDecline = () => {
        localStorage.setItem("cookie-consent", "false");
        closeWithExit();
    };

    if (!render) return null;

    const slideIn =
        position === "top" ? "slide-in-from-top-8" : "slide-in-from-bottom-8";
    const slideOut =
        position === "top" ? "slide-out-to-top-8" : "slide-out-to-bottom-8";

    return (
        <div
            role='dialog'
            aria-live='polite'
            aria-label='Cookie consent'
            className={cn(
                "fixed left-1/2 z-50 w-[95%] max-w-lg -translate-x-1/2",
                position === "top" ? "top-4" : "bottom-4"
            )}
        >
            <div
                className={cn(
                    "border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg",
                    "bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-50",
                    "p-4 flex flex-col sm:flex-row items-center gap-3",
                    visible
                        ? cn("animate-in", "fade-in", slideIn)
                        : cn("animate-out", "fade-out", slideOut),
                    "duration-300 ease-out",
                    className
                )}
            >
                <p className='text-sm flex-1 leading-normal font-medium'>{message}</p>

                <div className='flex gap-2 shrink-0'>
                    <button
                        type='button'
                        onClick={handleDecline}
                        className={cn(
                            "cursor-pointer px-3 py-1.5 rounded-md border border-slate-200 dark:border-slate-700",
                            "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-200 text-sm font-medium",
                            "transition-colors duration-200 hover:bg-slate-200 dark:hover:bg-slate-700"
                        )}
                    >
                        {declineText}
                    </button>

                    <button
                        type='button'
                        onClick={handleAccept}
                        className={cn(
                            "cursor-pointer px-3 py-1.5 rounded-md",
                            "bg-blue-600 dark:bg-blue-500 text-white text-sm font-semibold shadow-sm",
                            "transition-colors duration-200 hover:bg-blue-700 dark:hover:bg-blue-600"
                        )}
                    >
                        {acceptText}
                    </button>
                </div>
            </div>
        </div>
    );
};

export { CookieBanner };
