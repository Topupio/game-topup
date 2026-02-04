import React, { Suspense } from 'react';
import Navbar from '@/components/user/shared/Navbar';
import Footer from '@/components/user/shared/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Suspense fallback={null}>
                <Navbar />
            </Suspense>
            <div className='bg-background'>
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default Layout;