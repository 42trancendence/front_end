import Layout from "@/components/Layout";
import { SocketContext } from "@/lib/socketContext";
import { SocketProvider } from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { useContext } from "react";
import { ReactElement, useEffect } from "react";
import { useState } from "react";
import Canvas from "@/components/canvas/canvas";
import usePersistentState from "@/components/canvas/usePersistentState";
import ResultDialog from "@/components/ui/ResultDialog";

const Game: NextPageWithLayout = () => {
	const [gameRooms, setGameRooms] = useState([]);
	const [onGame, setOnGame] = usePersistentState('onGame', false);
	const { gameSocket:socket } = useContext(SocketContext);
	const [match, setMatch] = useState('자동 매칭');

	// socketio 로 게임방 목록 요청
	useEffect(() => {
		// console.log(socket);
		if (socket) {
			socket.on('getGameList', (data) => {
				// console.log(data);
				setGameRooms(data);
			})
			socket.on('getMatching', (data) => {
				console.log(`매칭되었습니당: ${data}`);
				setMatch('자동 매칭');
				// TODO
				// 매칭되면 게임방으로 이동
				setOnGame(true);
			})
			socket.on('getCancelMatching', (data) => {
				console.log(`매칭 취소되었습니당: ${data}`);
				setMatch('자동 매칭');
			})
			socket.on('postLeaveGame', (data) => {
        console.log('getLeaveGame: ', data);
        if (data == 'delete') {
					socket.emit('postLeaveGame');
        } else if (data == 'leave') {
					setOnGame(false);
        }
      })
			socket.on('finishGame', () => {
				setOnGame(false);
			})
			// socket.on('gaming', (data) => {
				//   console.log(data);
				// })
				// console.log('getGameList', socket)
				socket.emit('getGameList'); // 이거 삭제 해야 하나?
			}
		}, [socket])

		// socketio 로 자동 매칭 요청
		const handleMatching = () => {
			if (socket) {
				if (match == '자동 매칭') {
					socket.emit('postMatching');
					setMatch('매칭 중~~~');
				} else {
					socket.emit('postCancelMatching');
					setMatch('자동 매칭');
				}
			}
		}

		const hadleWatching = () => {
			if (socket) {
				socket.emit('postWatching');
				setOnGame(true);
			}
		}

		const {notifySocket: globalSocket} = useContext(SocketContext);
		useEffect(() => {
			globalSocket?.emit("updateActiveStatus", 3);
		}, [globalSocket]);

		return (
			<>
			{onGame ? (
				<div className="fixed bg-zinc-900 inset-0 flex items-center justify-center">
					<Canvas></Canvas>
				</div>

			) : (
				<div className="flex h-full w-full flex-col items-center px-8 py-6">
				{/* 자동 매칭 버튼 */}
				<button onClick={handleMatching} className="bg-zinc-600 w-[50%] font-bold text-xl text-indigo-300 h-20 rounded-lg hover:bg-zinc-400 hover:text-zinc-800" >
					{match}
				</button>
				{/* 게임방 목록 */}
				<div className="container mx-auto py-6">
					<div className="text-3xl font-bold text-indigo-400 mb-4">
						게임방 목록
					</div>
					<div className="grid grid-cols-1 gap-3 rounded-lg bg-zinc-600 p-5">
						<div className="flex divide-x-4 divide-zinc-400 content-start">
							<div className="flex w-1/3 flex-col items-center justify-center text-base">
							<p className="text-[#bbc2ff]">게임방 이름</p>
							</div>
							<div className="flex w-1/3 flex-col items-center justify-center space-y-3 text-base">
							<p className="text-[#bbc2ff]">상태</p>
							</div>
							<div className="flex w-1/3 flex-col items-center justify-center space-y-3 text-base">
							<p className="text-[#bbc2ff]">관전하기</p>
							</div>
						</div>

						{/* Replace this array with actual game room data */}
						{gameRooms.map((room: any, index) => (
							<div key={index} className="bg-zinc-800 text-white p-4 rounded-lg shadow">
								<div className="flex justify-between items-center px-10">
									<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
									<p className="font-bold">{room.title}</p>
									</div>
									<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
									<p className="font-bold">{room.status}</p>
									</div>
									{/* <span>{room.wa} players</span> */}
									<div className="flex w-1/4 flex-col items-center justify-center space-y-3 text-base">
									<button
										onClick={hadleWatching}
										className="rounded-lg bg-zinc-400 p-3 hover:bg-zinc-700 transition-colors cursor-pointer">
										관전하기
									</button>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
	)}
	</>);

}

Game.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
					<Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default Game;
