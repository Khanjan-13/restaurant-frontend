import HomeNavbar from '@/components/webComponent/Home/HomeNavbar'
import TableSection from '@/components/webComponent/Home/TableSection'
import React from 'react'

function Home() {
  return (
    <div className="min-h-screen bg-background pt-16 md:pt-16">
      <HomeNavbar />
      <TableSection />
    </div>
  )
}

export default Home
