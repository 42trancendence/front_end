import type { ReactElement } from 'react'
import Layout from '@/components/Layout'
import type { NextPageWithLayout } from '@/pages/_app'

const GameRooms: NextPageWithLayout = () => {
  return <p className='text-white'>this is game room</p>
}

GameRooms.getLayout = function getLayout(page: ReactElement) {
  return (
    <Layout>
    	{page}
    </Layout>
  )
}

export default GameRooms
