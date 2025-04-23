import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';

// DEBUG LOGGER
const DEBUG = {
  log: (component, action, data) => {
    console.log(`[DEBUG][${component}][${action}]`, data);
  },
  error: (component, action, error) => {
    console.error(`[DEBUG][${component}][${action}]`, error);
  },
  render: (component, returnValue) => {
    console.log(`[DEBUG][${component}][RENDER]`, {
      type: returnValue?.type?.name || typeof returnValue,
      isNull: returnValue === null,
      isUndefined: returnValue === undefined
    });
    return returnValue;
  }
};

const MobileNavBar = ({ activeItem }) => {
  DEBUG.log('MobileNavBar', 'FUNCTION_START', { activeItem });
  
  const router = useRouter();
  DEBUG.log('MobileNavBar', 'ROUTER_INIT', { 
    routerExists: !!router, 
    pathname: router?.pathname,
    isReady: router?.isReady
  });
  
  const [mounted, setMounted] = useState(false);
  
  // Only run on client side
  useEffect(() => {
    DEBUG.log('MobileNavBar', 'MOUNT_EFFECT_START', { mounted });
    
    try {
      setMounted(true);
      DEBUG.log('MobileNavBar', 'MOUNT_EFFECT_DONE', { mounted: true });
    } catch (error) {
      DEBUG.error('MobileNavBar', 'MOUNT_EFFECT_ERROR', error);
    }
  }, []);
  
  const isActive = (path) => {
    try {
      DEBUG.log('MobileNavBar', 'IS_ACTIVE_CHECK', { path, mounted, activeItem, routerPath: router?.pathname });
      
      if (!mounted) return '';
      
      // First check the explicit activeItem prop
      if (activeItem) {
        const isActivePath = activeItem === path.replace('/', '');
        DEBUG.log('MobileNavBar', 'IS_ACTIVE_PROP_RESULT', { path, activeItem, isActivePath });
        return isActivePath ? 'text-blue-500' : 'text-gray-500';
      }
      
      // Fall back to router pathname
      if (!router || router.pathname === undefined) {
        DEBUG.log('MobileNavBar', 'ROUTER_UNDEFINED', { router });
        return 'text-gray-500'; // Default when router is not available
      }
      
      const isActivePath = router.pathname === path;
      DEBUG.log('MobileNavBar', 'IS_ACTIVE_ROUTER_RESULT', { path, routerPath: router.pathname, isActivePath });
      return isActivePath ? 'text-blue-500' : 'text-gray-500';
    } catch (error) {
      DEBUG.error('MobileNavBar', 'IS_ACTIVE_ERROR', { path, error });
      return 'text-gray-500'; // Default on error
    }
  };

  // During SSR or before mount, return a placeholder
  if (!mounted) {
    const placeholderRender = (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 md:hidden">
        <div className="flex justify-around items-center">
          {/* Empty placeholders with same dimensions */}
          {[1, 2, 3, 4].map(item => (
            <div key={item} className="flex flex-col items-center text-gray-300">
              <div className="h-6 w-6"></div>
              <span className="text-xs mt-1 opacity-0">Placeholder</span>
            </div>
          ))}
        </div>
      </div>
    );
    
    DEBUG.log('MobileNavBar', 'PLACEHOLDER_RENDER', { mounted });
    return DEBUG.render('MobileNavBar', placeholderRender);
  }

  try {
    DEBUG.log('MobileNavBar', 'BEFORE_MAIN_RENDER', { 
      mounted, 
      activeItemParam: activeItem,
      routerPathname: router?.pathname
    });
    
    const mainRender = (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 md:hidden">
        <div className="flex justify-around items-center">
          <Link href="/dashboard">
            <a className={`flex flex-col items-center ${isActive('/dashboard')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          
          <Link href="/vehicles">
            <a className={`flex flex-col items-center ${isActive('/vehicles')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 4H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2z" />
              </svg>
              <span className="text-xs mt-1">Vehicles</span>
            </a>
          </Link>
          
          <Link href="/expenses-simple">
            <a className={`flex flex-col items-center ${isActive('/expenses-simple')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs mt-1">Expenses</span>
            </a>
          </Link>
          
          <Link href="/profile">
            <a className={`flex flex-col items-center ${isActive('/profile')}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span className="text-xs mt-1">Profile</span>
            </a>
          </Link>
        </div>
      </div>
    );
    
    DEBUG.log('MobileNavBar', 'RENDER_COMPLETE', { 
      isNull: mainRender === null, 
      isUndefined: mainRender === undefined 
    });
    
    return DEBUG.render('MobileNavBar', mainRender);
  } catch (renderError) {
    DEBUG.error('MobileNavBar', 'RENDER_ERROR', renderError);
    
    // Fallback render on error
    return DEBUG.render('MobileNavBar', (
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 py-3 px-4 md:hidden">
        <div className="flex justify-around items-center">
          <div className="text-red-500 text-xs">Navigation Error</div>
        </div>
      </div>
    ));
  }
};

export default MobileNavBar; 