import Head from 'next/head'
import Link from 'next/link'
import { useState } from 'react'

export default function Home() {
  const [activeTab, setActiveTab] = useState('driver');

  return (
    <div className="min-h-screen bg-white">
      <Head>
        <title>Stijoi Stephen Taxi Millionaire</title>
        <meta name="description" content="Track Tesla taxi rides to millionaire status" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Navigation */}
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link href="/">
            <a className="flex items-center">
              <span className="text-2xl font-bold text-yellow-500">STIJOI</span>
              <span className="text-2xl font-bold text-gray-800 ml-1">TAXI</span>
            </a>
          </Link>
          
          <div className="flex items-center space-x-6">
            <Link href="/about">
              <a className="text-gray-600 hover:text-gray-900">About</a>
            </Link>
            <Link href="/business">
              <a className="text-gray-600 hover:text-gray-900">Business</a>
            </Link>
            <Link href="/help">
              <a className="text-gray-600 hover:text-gray-900">Help</a>
            </Link>
            <Link href="/login">
              <a className="text-gray-600 hover:text-gray-900 font-medium">Login</a>
            </Link>
            <Link href="/register">
              <a className="bg-yellow-500 text-white px-4 py-2 rounded-md font-medium hover:bg-yellow-600 transition-colors">
                Register
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 to-transparent z-10"></div>
        <div className="relative h-[500px] bg-cover bg-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1619253301346-361077fd63c9?q=80&w=2070')" }}>
          <div className="container mx-auto px-4 h-full flex items-center">
            <div className="max-w-lg z-20">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Track Your Journey to €1 Million
              </h1>
              <p className="text-xl text-white mb-8 opacity-90">
                The ultimate tool for Tesla taxi drivers to track earnings and reach your financial goals.
              </p>
              <div className="flex space-x-4">
                <Link href="/register">
                  <a className="bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 rounded-md font-bold text-lg transition-colors">
                    Get Started
                  </a>
                </Link>
                <Link href="/about">
                  <a className="bg-white hover:bg-gray-100 text-gray-800 px-6 py-3 rounded-md font-bold text-lg transition-colors">
                    Learn More
                  </a>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Box */}
      <div className="container mx-auto px-4 py-8 -mt-16 relative z-20">
        <div className="bg-white rounded-lg shadow-xl p-6 max-w-3xl mx-auto">
          <div className="flex border-b mb-6">
            <button 
              className={`pb-3 px-4 font-medium ${activeTab === 'driver' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('driver')}
            >
              Driver Login
            </button>
            <button 
              className={`pb-3 px-4 font-medium ${activeTab === 'passenger' ? 'text-yellow-500 border-b-2 border-yellow-500' : 'text-gray-500'}`}
              onClick={() => setActiveTab('passenger')}
            >
              Passenger
            </button>
          </div>
          
          {activeTab === 'driver' ? (
            <div>
              <p className="text-gray-700 mb-4">Login to track your Tesla taxi earnings towards your €1,000,000 goal.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Link href="/login">
                  <a className="bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded text-center font-medium transition-colors">
                    Login
                  </a>
                </Link>
                <Link href="/register">
                  <a className="bg-gray-800 hover:bg-gray-900 text-white py-3 px-4 rounded text-center font-medium transition-colors">
                    Create Account
                  </a>
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <p className="text-gray-700 mb-4">Book a ride with our professional Tesla drivers.</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Pick-up Location</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                    placeholder="Enter pick-up address"
                  />
                </div>
                <div>
                  <label className="block text-gray-700 text-sm font-medium mb-2">Destination</label>
                  <input 
                    type="text" 
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-yellow-500" 
                    placeholder="Enter destination address"
                  />
                </div>
                <div className="md:col-span-2">
                  <button className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-4 rounded font-medium transition-colors">
                    Book Your Ride
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-gray-50 py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">Why Choose Stijoi Taxi</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Fast & Reliable</h3>
              <p className="text-gray-600">Our Tesla taxis get you to your destination quickly and reliably every time.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Safe & Secure</h3>
              <p className="text-gray-600">All our drivers are vetted and our Tesla vehicles are regularly maintained.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Easy Payment</h3>
              <p className="text-gray-600">Multiple payment options available including cash, card, and mobile payment.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver CTA Section */}
      <div className="bg-gray-900 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">Are You a Tesla Driver?</h2>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Join our platform and track your progress to €1,000,000. We provide all the tools you need to maximize your earnings.
          </p>
          <Link href="/register">
            <a className="inline-block bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-4 rounded-md font-bold text-lg transition-colors">
              Become a Driver
            </a>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">Stijoi Taxi</h3>
              <p className="text-gray-400">The ultimate platform for Tesla taxi drivers to track earnings and reach €1,000,000.</p>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/about"><a className="text-gray-400 hover:text-white">About Us</a></Link></li>
                <li><Link href="/careers"><a className="text-gray-400 hover:text-white">Careers</a></Link></li>
                <li><Link href="/blog"><a className="text-gray-400 hover:text-white">Blog</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Support</h3>
              <ul className="space-y-2">
                <li><Link href="/help"><a className="text-gray-400 hover:text-white">Help Center</a></Link></li>
                <li><Link href="/contact"><a className="text-gray-400 hover:text-white">Contact Us</a></Link></li>
                <li><Link href="/faq"><a className="text-gray-400 hover:text-white">FAQs</a></Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-bold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/terms"><a className="text-gray-400 hover:text-white">Terms of Service</a></Link></li>
                <li><Link href="/privacy"><a className="text-gray-400 hover:text-white">Privacy Policy</a></Link></li>
                <li><Link href="/cookies"><a className="text-gray-400 hover:text-white">Cookie Policy</a></Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {new Date().getFullYear()} Stijoi Stephen Taxi Millionaire. All rights reserved.</p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Facebook</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Instagram</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <span className="sr-only">Twitter</span>
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 