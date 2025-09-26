import React from 'react'
import { assets } from '../../assets/assets'
import { Link } from 'react-router-dom'

const Footer = ({
    logo = assets.HiLCoE_Logo,
    brand = 'HiLCoE',
    tagline = 'School Research Management System',
    openingHours = [
        { label: 'Mon–Sat: Morning', value: '8:30 AM – 12:30 PM' },
        { label: 'Mon – Fri: Afternoon', value: '2PM – 5 PM' }
    ],
    pages = [
        { label: 'Home', href: '#' },
        { label: 'Features', href: '#' },
        { label: 'About Us', href: '#' },
        { label: 'Contact Us', href: '#' }
    ],
    contact = {
        address: 'Arat Kilo, General Wingate St., Next to Ayerbote Library.',
        email: 'info@hilcoe.net',
        phones: ['+(251) 111564888', '+(251) 111564900', '+(251) 111559789']
    }
}) => {
    return (
        <footer className='bg-gradient-to-b from-blue-900 to-blue-950 w-full p-0 overflow-hidden  bottom-0 left-0 right-0'>
            <div className='mx-auto grid grid-cols-1 md:grid-cols-3 gap-0 text-white/90 border-t border-white/90'>
                {/* Brand + Opening Hours */}
                <div className='border-b-0 md:border-b-0 md:border-r border-white/90 p-10'>
                    <div className='flex items-center gap-4 border-b border-white/90 pb-6 mb-6 -mx-10 px-30'>
                        <img src={logo} alt={brand} className='w-20 h-20 rounded-sm' />
                        <div>
                            <p className='text-2xl font-caprasimo font-black tracking-wider ml-30'>{brand}</p>
                            <p className='text-[17px] font-poppins opacity-80'>{tagline}</p>
                        </div>
                    </div>
                    <h4 className='text-2xl font-semibold mb-3 ml-19 mt-10'>Opening Hours</h4>
                    <ul className='space-y-2 text-[16px] px-20'>
                        {openingHours.map((row, i) => (
                            <li key={i}>
                                <p className='underline underline-offset-4'>{row.label}</p>
                                <p className='opacity-80'>{row.value}</p>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Pages */}
                <div className='border-b-0 md:border-b-0 md:border-r border-white/90 p-15'>
                    <h4 className='text-2xl font-semibold mb-10'>Pages</h4>
                     <ul className='space-y-3 text-[19px]'>
                         {pages.map((p, i) => (
                             <li key={i}>
                                 {p.to ? (
                                   <Link to={p.to} className='hover:underline underline-offset-4'>
                                     {p.label}
                                   </Link>
                                 ) : (
                                   <a href={p.href || '#'} className='hover:underline underline-offset-4'>
                                     {p.label}
                                   </a>
                                 )}
                             </li>
                         ))}
                     </ul>
                    <div className='mt-35 text-center text-[17px] text-white/60'>
                        © {new Date().getFullYear()} {brand}. All rights reserved.
                    </div>
                </div>

                {/* Contact */}
                <div className='p-15'>
                    <h4 className='text-2xl font-semibold mb-10'>Contact</h4>
                    <div className='space-y-2 text-[18px]'>
                        <p className='opacity-90'>{contact.address}</p>
                        <a href={`mailto:${contact.email}`} className='underline underline-offset-4 block'>
                            {contact.email}
                        </a>
                        {contact.phones.map((ph, i) => (
                            <a key={i} href={`tel:${ph.replace(/[^+\d]/g, '')}`} className='underline underline-offset-4 block'>
                                {ph}
                            </a>
                        ))}
                    </div>
                </div>
            </div>
            
        </footer>
    )
}

export default Footer