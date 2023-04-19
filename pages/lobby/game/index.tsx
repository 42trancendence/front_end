import Layout from "@/components/Layout";
import { GameSocketContext } from "@/lib/socketContext";
import { GameSocketProvider, SocketProvider } from "@/lib/socketContext";
import { NextPageWithLayout } from "@/pages/_app";
import { useContext } from "react";
import { ReactElement, useEffect } from "react";
import { useState } from "react";
import Canvas from "../../../components/canvas";

const Game: NextPageWithLayout = () => {
	const [gameRooms, setGameRooms] = useState([]);
	const [onGame, setOnGame] = useState(false);
	const { socket } = useContext(GameSocketContext);
	// socketio 로 자동 매칭 요청
	const handleMatching = () => {
		if (socket) {
			socket.emit('postMatching');
		}
	}

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
				// TODO
				// 매칭되면 게임방으로 이동
				setOnGame(true);
			})
			// socket.on('gaming', (data) => {
      //   console.log(data);
      // })
			// console.log('getGameList', socket)
			socket.emit('getGameList');
		}
	}, [socket])

	return (
		onGame ? (
			<Canvas></Canvas>
		) : (
			<div className="flex h-full w-full flex-col items-center px-8 py-6">
				{/* 자동 매칭 버튼 */}
				<button onClick={handleMatching} className="bg-zinc-400 w-[50%] text-black h-20 rounded-lg hover:bg-white hover:text-zinc-800" >
					자동 매칭
				</button>
				{/* 게임방 목록 */}
				<div className="container mx-auto py-6">
					<div className="text-2xl font-bold mb-4">
						게임방 목록
					</div>
					<div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-400 p-5">
						{/* Replace this array with actual game room data */}
						{gameRooms.map((room, index) => (
							<div key={index} className="bg-zinc-800 text-white p-4 rounded-lg shadow">
								<div className="flex justify-between items-center px-10">
									<span className="font-bold">{room.roomId}</span>
									<span>{room.status}</span>
									{/* <span>{room.wa} players</span> */}
									<button className="rounded-lg bg-zinc-400 p-3 hover:bg-zinc-700 transition-colors cursor-pointer">관전하기</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
	));
}

Game.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
			<GameSocketProvider>
				<Layout>{page}</Layout>
			</GameSocketProvider>
		</SocketProvider>
	);
};

export default Game;