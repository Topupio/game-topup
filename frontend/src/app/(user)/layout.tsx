import React, { Suspense } from 'react';
import Navbar from '@/components/user/shared/Navbar';
import Footer from '@/components/user/shared/Footer';
import FloatingSupportButton from '@/components/user/shared/FloatingSupportButton';
import PayPalProvider from '@/components/providers/PayPalProvider';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <PayPalProvider>
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
        </PayPalProvider>
    )
}

export default Layout;