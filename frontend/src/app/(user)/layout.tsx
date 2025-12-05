import React from 'react';
import Navbar from '@/components/user/shared/Navbar';
import Footer from '@/components/user/shared/Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
    return (
        <div>
            <Navbar />
            <div className='bg-linear-to-b from-primary to-primary/90'>
                {children}
            </div>
            <Footer />
        </div>
    )
}

export default Layout;