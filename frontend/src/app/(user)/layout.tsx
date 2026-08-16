import React, { Suspense } from 'react';
import Navbar from '@/components/user/shared/Navbar';
import Footer from '@/components/user/shared/Footer';
import FloatingSupportButton from '@/components/user/shared/FloatingSupportButton';
import PayPalProvider from '@/components/providers/PayPalProvider';
import { WalletProvider } from '@/context/WalletContext';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <PayPalProvider>
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
        </PayPalProvider>
    )
}

export default Layout;