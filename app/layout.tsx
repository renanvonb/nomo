import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const inter = Inter({
    subsets: ["latin"],
    variable: "--font-inter",
    display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
    subsets: ["latin"],
    variable: "--font-jakarta",
    display: 'swap',
});

export const metadata: Metadata = {
    title: "Nomo | Gestão Financeira Inteligente",
    description: "Plataforma de gestão financeira, jurídica e de documentos com foco em eficiência.",
};

export const viewport: Viewport = {
    themeColor: '#fafafa',
    width: 'device-width',
    initialScale: 1,
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="pt-BR" suppressHydrationWarning>
            <body
                className={cn(
                    "min-h-screen bg-zinc-50 font-sans antialiased text-zinc-950",
                    inter.variable,
                    jakarta.variable
                )}
            >
                {children}
                <Toaster
                    position="bottom-right"
                    richColors
                    closeButton
                    expand={false}
                    toastOptions={{
                        className: 'font-sans',
                        style: {
                            fontFamily: 'var(--font-inter)',
                        }
                    }}
                />
            </body>
        </html>
    );
}


