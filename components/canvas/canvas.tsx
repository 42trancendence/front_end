import React, { RefObject, useEffect, useRef, useState, useContext } from 'react'
import { GameSocketContext } from '@/lib/socketContext';
import usePersistentState from "@/components/canvas/usePersistentState";
import router from "next/router";

interface MyComponentProps {
  startGame: string;
  setStartGame: boolean;
}

// const Canvas: React.FC<MyComponentProps> = (startGame, setStartGame) => {
const Canvas: React.FC = () => {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [gameData, setGameData] = useState(null);
  const [ready, setReady] = useState(false);
  const [startGame, setStartGame] = usePersistentState('startGame', false);
  const [difficulty, setDifficulty] = useState(false);

  // 컨텍스트 세팅
  useEffect(() => {
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      setCtx(context);
    }
  }, []);

  // 소켓 연결(컨텍스트 세팅, gameSocket.id 가 초기화 되는지 확인 필요)
	const { gameSocket } = useContext(GameSocketContext);
  useEffect(() => {
    // console.log(gameSocket);
    if (gameSocket) {
      gameSocket.on('updateGame', (data) => {

        setGameData(data);
      })
      gameSocket.on('setStartGame', (data) => {
        if (data == 'start') {
          setStartGame(true);
        } else {
          setStartGame(false);
          alert(data);
        }
        console.log(`setStartGame: ${data}`);
      })
      // gameSocket.on('getGameHistory', () => {
			// 	setStartGame(false);
			// })
    }
  }, [gameSocket, setStartGame, setReady])

  // 컨텍스트가 세팅되면 그림 그리기
  useEffect(() => {
    render();
  }, [ctx, gameData, startGame]);

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
      gameSocket?.emit('postKey', 'up');
    } else if (e.key === 'ArrowRight') {
      gameSocket?.emit('postKey', 'down');
    } 
  }

  const handleReadyGame = () => {
    setReady(!ready);
    if (gameSocket) {
      gameSocket.emit('postReadyGame');
    }
  }

  const handleDifficulty = () => {
    if (gameSocket) {
      gameSocket.emit('postDifficulty', difficulty ? 'normal' : 'hard');
      setDifficulty(!difficulty);
    }
  }

  const handleLeaveGame = () => {
    if (gameSocket) {
      gameSocket.emit('postLeaveGame');
      // 나갈시 새로고침 -> 게임전적 최신화
      // router.push("/lobby/overview");
    }
  }

  return (
    <>
      <div
        tabIndex={0} // 키보드 포커스를 위한 tabIndex 설정
        style={{ outline: 'none' }} // 선택시 브라우저가 테두리를 그리지 않도록 함
        onKeyDown={handleKeyDown} // 함수 자체를 전달
      >
        <canvas 
          ref={canvasRef} width={500} height={500}
        />
      </div>
      {startGame ? 
        <div>
          게임 시작
        </div>
        :
        // 가운데 정렬
        <div className='mx-auto my-auto space-y-4'>
          <div>
            <div className='text-center mb-2'>
              난이도
            </div>
            <div className='text-center'>
              <button
                onClick={() => handleDifficulty()}
                className='bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'
              >
                {difficulty ? 'hard' : 'normal' }
              </button>
            </div>
          </div>

          <div
              className='space-x-4'
          >
            <button
              onClick={() => handleReadyGame()}
              className={'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'}
            >
              {ready ? '준비완료' : '준비' }
            </button>
            <button
              onClick={() => handleLeaveGame()}
              className={'bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'}
            >
              나가기
            </button>
          </div>
        </div>
    }
    </>
  )
}

export default Canvas