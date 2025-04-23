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
              <div className="h-6 w-6 flex items-center justify-center font-bold">H</div>
              <span className="text-xs mt-1">Home</span>
            </a>
          </Link>
          
          <Link href="/vehicles">
            <a className={`flex flex-col items-center ${isActive('/vehicles')}`}>
              <div className="h-6 w-6 flex items-center justify-center font-bold">V</div>
              <span className="text-xs mt-1">Vehicles</span>
            </a>
          </Link>
          
          <Link href="/expenses-simple">
            <a className={`flex flex-col items-center ${isActive('/expenses-simple')}`}>
              <div className="h-6 w-6 flex items-center justify-center font-bold">E</div>
              <span className="text-xs mt-1">Expenses</span>
            </a>
          </Link>
          
          <Link href="/profile">
            <a className={`flex flex-col items-center ${isActive('/profile')}`}>
              <div className="h-6 w-6 flex items-center justify-center font-bold">P</div>
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