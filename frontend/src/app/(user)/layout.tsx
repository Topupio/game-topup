import { cookies } from "next/headers";
import { StoreTheme } from "@/components/user/shared/StoreTheme";
import React, { Suspense } from 'react';
import Navbar from '@/components/user/shared/Navbar';
import Footer from '@/components/user/shared/Footer';
import FloatingSupportButton from '@/components/user/shared/FloatingSupportButton';
import PayPalProvider from '@/components/providers/PayPalProvider';
import { WalletProvider } from '@/context/WalletContext';

const Layout = async ({ children }: { children: React.ReactNode }) => {
    const theme = (await cookies()).get("topupioTheme")?.value === "dark" ? "dark" : "light";
  return (
        <StoreTheme initialTheme={theme}><PayPalProvider>
            {/* Storefront only — the admin area has its own wallet screens and does not
                need a customer balance in context. */}
            <WalletProvider>
                <div>
                    <Suspense fallback={null}>
                        <Navbar />
                    </Suspense>
                    <div className='bg-background'>
                        {children}
                    </div>
                    <Footer />
                    <FloatingSupportButton />
                </div>
            </WalletProvider>
        </PayPalProvider></StoreTheme>
    )
}

export default Layout;