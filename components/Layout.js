import React from 'react'
import Head from 'next/head'

const Layout = ({ children, title = 'Taxi App' }) => {
  return (
    <>
      <Head>
        <title>{title}</title>
        <meta name="description" content="Taxi management application" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <main>
        {children}
      </main>
    </>
  )
}

export default Layout 