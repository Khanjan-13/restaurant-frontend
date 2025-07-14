import HomeNavbar from '@/components/webComponent/Home/HomeNavbar'
import TableSection from '@/components/webComponent/Home/TableSection'
import React from 'react'

function Home() {
  return (
    <div className="pt-12 flex flex-1 flex-col ">
     <HomeNavbar />
     <TableSection />
    </div>
  )
}

export default Home
