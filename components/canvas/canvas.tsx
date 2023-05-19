import React, { RefObject, useEffect, useRef, useState, useContext } from 'react'
import { SocketContext } from '@/lib/socketContext';
import usePersistentState from "@/components/canvas/usePersistentState";
import Image from "next/image";
import GameModal from "../GameModal";
import router from "next/router";
import { handleRefresh } from "@/lib/auth-client";
import ProfileBackground from "@/public/profile_background.jpg";
import { NotifyContext } from "@/lib/notifyContext";
import { toast } from "react-toastify";

const Canvas: React.FC = () => {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [gameData, setGameData] = useState(null);
  const [ready, setReady] = useState(false);
  const [startGame, setStartGame] = usePersistentState('startGame', false);
  const [difficulty, setDifficulty] = usePersistentState('difficulty' ,false);
  const [changeScore, setChangeScore] = usePersistentState('score', false);
  const [players, setPlayers] = useState(['player1', 'player2']);
  const [avatarUrls, setAvatarUrls] = useState(['','']);
  const [score, setScore] = useState([0, 0]);
  const [showGameModal, setShowGameModal] = usePersistentState('gameModal', false);
  const [viewReady, setViewReady] = useState([]);
  
  // 컨텍스트 세팅
  useEffect(() => {
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');

      setCtx(context);
    }

		let accessToken = localStorage.getItem("token");

		const getGamePlayersInfo =  async (roomId: any) => {
			try {
				const res = await fetch(`${process.env.NEXT_PUBLIC_SERVER_ADDRESS}/game/${roomId}`, {
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						Authorization: `Bearer ${accessToken}`,
					},
				});
				if (res.ok) {
					const playersInfo = await res.json();

					setPlayers([playersInfo.player1.name, playersInfo.player2.name]);
          setScore([playersInfo.player1Score, playersInfo.player2Score])
					setAvatarUrls([playersInfo.player1?.avatarImageUrl, playersInfo.player2?.avatarImageUrl]);

					return playersInfo;
				} else if (res.status === 401){
					// Unauthorized, try to refresh the access token
					const newAccessToken = await handleRefresh();
					if (!newAccessToken) {
						router.push("/");
					}
				} else {
					return null;
				}
			} catch (error) {
				console.log(error);
			}
		}
    const roomId = router.query.roomId;
		getGamePlayersInfo(roomId);
  }, []);

  const { failed } = useContext(NotifyContext);
	function leaveGame() {
		failed({
			header: "게임요청",
      type: "global",
			message: "게임에서 퇴장되었습니다.",
		});
	}

  // 소켓 연결(컨텍스트 세팅, socket.id 가 초기화 되는지 확인 필요)
	const { gameSocket } = useContext(SocketContext);

  useEffect(() => {
    if (gameSocket) {
      gameSocket.on('updateGame', (data) => {
        setGameData(data);
      })
      gameSocket.on('setStartGame', (data) => {
        if (data == 'start') {
          setDifficulty(false);
          setChangeScore(false);
          setStartGame(true);
          canvasRef.current?.focus(); // 포커스
        } else {
          setShowGameModal(true);
        }
      })
      gameSocket.on('postDeleteGame', () => {
        gameSocket.emit('postLeaveGame', (error: any) => {
          setDifficulty(false);
          setChangeScore(false);
          if (error.status == 'FATAL') {
            toast.error(error.message);
            router.push("/lobby/overview");
          }
          else if (error.status == 'ERROR') {
            toast.warning(error.message);
            router.push("/lobby/overview");
          }
          else if (error.status == 'WARNING') {
            toast.warning(error.message);
            router.push("/lobby/overview");
          }
          else if (error.status == 'OK') {
          }
        });
      })

      gameSocket.on('postLeaveGame', (data: string) => {
        router.replace('/lobby/overview');
        setDifficulty(false);
        setChangeScore(false);
        if (data !== 'finishGame') {
          leaveGame();
        }
      })

      gameSocket.on('getWhoReady', (data) => {
        setViewReady(data);
      })
    }
    return () => {
      gameSocket?.off('updateGame');
      gameSocket?.off('setStartGame');
      gameSocket?.off('postDeleteGame');
      gameSocket?.off('postLeaveGame')
      gameSocket?.off('getWhoReady');
    }
  }, [gameSocket])

  // 컨텍스트가 세팅되면 그림 그리기
  useEffect(() => {
    render();
  }, [ctx, gameData, startGame]);

  const render = () => {
    if (ctx && gameData) {
      ctx.clearRect(0, 0, 1024, 640);
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, 1024, 640);
      drawPaddle(gameData?.paddles_[0]);
      drawPaddle(gameData?.paddles_[1]);
      drawBall(gameData?.ball_.x_, gameData?.ball_.y_);
      setScore([gameData?.score_[0], gameData?.score_[1]]);
    }
  }

  const drawPaddle = (paddle: Object) => {
    if (ctx) {
      ctx.fillStyle = 'magenta';
      ctx.fillRect(paddle?.x_, paddle?.y_, paddle?.width_, paddle?.height_);
    }
  }

  const drawBall = (x: number, y:number) => {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(x, y, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'red';
      ctx.fill();
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(e.key);
    if (e.key === 'ArrowUp') {
      gameSocket?.emit('postKey', 'up', (error: any) => {
        if (error.status == 'FATAL') {
          toast.error(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'ERROR') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'WARNING') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'OK') {
        }
      });
    } else if (e.key === 'ArrowDown') {
      gameSocket?.emit('postKey', 'down', (error: any) => {
        if (error.status == 'FATAL') {
          toast.error(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'ERROR') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'WARNING') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'OK') {
        }
      });
    }
  }

  const handleReadyGame = () => {
    setReady(!ready);
    if (gameSocket) {
      gameSocket.emit('postReadyGame' , (error: any) => {
        if (error.status == 'FATAL') {
          toast.error(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'ERROR') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'WARNING') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'OK') {
        }
      });
    }
  }

  const handleDifficulty = () => {
    if (gameSocket) {
      gameSocket.emit('postDifficulty', difficulty ? 'normal' : 'hard', (error: any) => {
        if (error.status == 'FATAL') {
          toast.error(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'ERROR') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'WARNING') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'OK') {
        }
      });
      setDifficulty(!difficulty);
    }
  }

  const handleChangeScore = () => {
    if (gameSocket) {
      gameSocket.emit('postChangeScore', changeScore ? 'normal' : 'hard', (error: any) => {
        if (error.status == 'FATAL') {
          toast.error(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'ERROR') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'WARNING') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'OK') {
        }
      });
      setChangeScore(!changeScore);
    }
  }

  const handleLeaveGame = () => {
    if (gameSocket) {
      gameSocket.emit('postDeleteGame', (error: any) => {
        if (error.status == 'FATAL') {
          toast.error(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'ERROR') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'WARNING') {
          toast.warning(error.message);
          router.push("/lobby/overview");
        }
        else if (error.status == 'OK') {
        }
      });
    }
  }


  const handleNotifyClose = () => {
    gameSocket?.emit('postLeaveGame', 'finishGame')
    setShowGameModal(false);
    setStartGame(false);
  }

  return (
    <>
      <Image
        className='absolute top-0 left-0 z-0 w-full h-full object-cover'
        src={ProfileBackground}
        alt=''
      ></Image>
      <div className='relative w-full'>
        <div
          tabIndex={0} // 키보드 포커스를 위한 tabIndex 설정
          style={{ outline: 'none' }} // 선택시 브라우저가 테두리를 그리지 않도록 함
          onKeyDown={handleKeyDown} // 함수 자체를 전달
          className='flex flex-col justify-center items-center w-full'>
        <nav className="relative px-4 py-4 flex flex-row justify-between items-center bg-black w-full my-4">
        <div className='flex'>
          <div className="flex flex-col items-center mt-2">
            <Image
              className="h-10 w-10 rounded-full bg-red-600 ring-zinc-800"
              src={avatarUrls[0]}
              alt=""
              width={300}
              height={300}
            />
            <a className="text-blue-600 text-zinc-300">{players[0]}</a>
          </div>
          <a className='ml-5 text-6xl'>
            { startGame ? '' : viewReady[0] ? 'READY' : '' }
          </a>
        </div>
      <ul className="absolute top-1/2 left-1/2 transform -translate-y-1/2 -translate-x-1/2 lg:flex lg:mx-auto lg:flex lg:items-center lg:w-auto lg:space-x-6">
        <li>
          <a className="text-3xl text-white font-bold">{`${score[0]}  -  ${score[1]}`}</a>
        </li>
      </ul>
      <div className='flex'>
        <a className='mr-5 text-6xl'>
          { startGame ? '' : viewReady[1] ? 'READY' : '' }
        </a>
        <div className="flex flex-col items-center mt-2">
          <Image
            className="h-10 w-10 rounded-full bg-green-400 ring-zinc-800"
            src={avatarUrls[1]}
            alt=""
            width={300}
            height={300}
          />
          <a className="text-blue-600 text-zinc-300">{players[1]}</a>
        </div>
      </div>
    </nav>
      {startGame ?
        <div className='flex mb-3'>
          <a className='mr-3 inline-block p-2 border border-green-100 rounded text-gray-500 no-underline'>
            {`난이도: ${gameData?.difficulty_ ? gameData?.difficulty_ : 'normal'}`}
          </a>
          <a className='inline-block p-2 border border-green-100 rounded text-gray-500 no-underline'>
            {`최종점수: ${gameData?.finalScore_ ? gameData?.finalScore_ : '5'}`}
          </a>
        </div> : ''
      }
          <canvas
            ref={canvasRef} width={1024} height={640}
          />
          <GameModal
            onClose={handleNotifyClose}
            visible={showGameModal}
            player1Name={players[0]}
            player2Name={players[1]}
            player1Score={score[0]}
            player2Score={score[1]}
          />
        </div>
        {startGame ?
          ''
          :
          // 가운데 정렬
          <div className="absolute w-full flex items-center justify-center m-auto inset-0">
            <div>
              <div className='flex'>
                <div className='text-center my-10'>
                  <div className='text-center mb-4 text-2xl font-bold text-indigo-400'>
                    난이도
                  </div>
                  <div className='text-center'>
                    <button
                      onClick={() => handleDifficulty()}
                      className={`bg-${difficulty ? 'red' : 'zinc'}-400 hover:bg-${difficulty ? 'zinc' : 'red'}-600 w-40 h-60 text-white text-xl font-bold py-2 px-4 rounded`}
                    >
                      {difficulty ? 'hard' : 'normal'}
                    </button>
                  </div>
                </div>
                <div className='text-center space-x-4 my-10'>
                  <div className='text-center ml-3 mb-4 text-2xl font-bold text-indigo-400'>
                    스코어
                  </div>
                  <div className='text-center'>
                    <button
                      onClick={() => handleChangeScore()}
                      className={`bg-${changeScore ? 'red' : 'zinc'}-400 hover:bg-${changeScore ? 'zinc' : 'red'}-600 w-40 h-60 text-white text-xl font-bold py-2 px-4 rounded`}
                    >
                      {changeScore ? '10점' : '5점'}
                    </button>
                  </div>
                </div>
              </div>

              <div
                  className='space-x-4'
              >
                <button
                  onClick={() => handleReadyGame()}
                  className={'bg-zinc-600 w-40 text-indigo-400 hover:bg-zinc-400 hover:text-zinc-800 py-2 px-4 rounded'}
                >
                  {ready ? '준비완료' : '준비' }
                </button>
                <button
                  onClick={() => handleLeaveGame()}
                  className={'bg-zinc-600 w-40 text-indigo-400 hover:bg-zinc-400 hover:text-zinc-800 py-2 px-4 rounded'}
                >
                  나가기
                </button>
              </div>
            </div>
          </div>
      }
      </div>
    </>
  )
}

export default Canvas
