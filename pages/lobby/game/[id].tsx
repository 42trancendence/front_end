import Canvas from '../../../components/canvas'
import { NextPageWithLayout } from '@/pages/_app'
import { ReactElement } from 'react'
import { GameSocketProvider } from '@/lib/socketContext'

const PingPong: NextPageWithLayout = () => {
  return (
    <div>
      <Canvas></Canvas>
    </div>
  )
}


PingPong.getLayout = function getLayout(page: ReactElement) {
	return (
    <GameSocketProvider>
      {page}
    </GameSocketProvider>
	);
};

export default PingPong


