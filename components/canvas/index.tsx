import React, { RefObject, useEffect, useRef, useState, useContext } from 'react'
import { GameSocketContext } from '@/lib/socketContext';

const Canvas: React.FC = () => {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [gameData, setGameData] = useState(null);
  const [ready, setReady] = useState(false);
  const [startGame, setStartGame] = useState(false);

  // 컨텍스트 세팅
  useEffect(() => {
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      setCtx(context);
    }
  }, [canvasRef]);

  // 소켓 연결(컨텍스트 세팅, socket.id 가 초기화 되는지 확인 필요)
	const { socket } = useContext(GameSocketContext);
  useEffect(() => {
    console.log(socket);
    if (socket) {
      socket.on('updateGame', (data) => {
        // console.log(data);
        setGameData(data);
      })
      socket.on('startGame', () => {
        setStartGame(true);
        console.log('startGame')
      })
      socket.on('postLeaveGame', () => {
        setStartGame(false);
        socket.emit('postLeaveGame');
        console.log('getLeaveGame')
      })
    }
  }, [socket, startGame])

  // 컨텍스트가 세팅되면 그림 그리기
  useEffect(() => {
    // if (ctx) {
    //   ctx.fillStyle = 'white';
    //   ctx.fillRect(0, 0, 500, 500);
    // };
    render();
  }, [ctx, gameData]);
  
  const render = () => {
    if (ctx && gameData) {
      ctx.clearRect(0, 0, 500, 500);
      ctx.fillStyle = 'gray';
      ctx.fillRect(0, 0, 500, 500);
      drawPaddle(gameData?.paddles_[0]);
      drawPaddle(gameData?.paddles_[1]);
      drawBall(gameData?.ball_.x_, gameData?.ball_.y_);
      drawText();
    }
  }
  
  const drawPaddle = (paddle: Object) => {
    if (ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(paddle?.x_, paddle?.y_, paddle?.width_, paddle?.height_);
    }
  }
  
  const drawBall = (x: number, y:number) => {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'blue';
      ctx.fill();
    }
  }
  
  const drawText = () => {
    if (ctx) {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText(gameData?.score_, 100, 100);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(e.key);
    if (e.key === 'ArrowLeft') {
      socket?.emit('postKey', 'up');
    } else if (e.key === 'ArrowRight') {
      socket?.emit('postKey', 'down');
    } 
  }

  const handleReady = () => {
    setReady(!ready);
    if (socket) {
      socket.emit('postReady', !ready);
    }
  }

  return (
    startGame ? 
      <div
        tabIndex={0} // 키보드 포커스를 위한 tabIndex 설정
        style={{ outline: 'none' }} // 선택시 브라우저가 테두리를 그리지 않도록 함
        onKeyDown={handleKeyDown} // 함수 자체를 전달
      >
        <canvas 
          ref={canvasRef} width={500} height={500}
          />
      </div>
      :
      <div>
        <button 
          onClick={() => handleReady()}
          className={'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'}
        >
          {ready ? '준비완료' : '준비' }
        </button>
      </div>
  )
}

export default Canvas