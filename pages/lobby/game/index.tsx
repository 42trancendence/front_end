import Layout from "@/components/Layout";
import { useEffect } from "react";
import { io, Socket } from "socket.io-client";

export default function GameRoom({ pageProps }: { pageProps?: any }) {
	const gameRoom = [
		{
			name: 'game1',
			mode: '1v1',
			playerNum: 2
		},
		{
			name: 'game2',
			mode: '1v1',
			playerNum: 2
		},
		{
			name: 'game3',
			mode: '1v1',
			playerNum: 2
		},
	]

	useEffect((): any => {
		// socketio 백엔드 접속
		const socket = io('http://localhost:3000/game', {
			extraHeaders: {
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		}); // Replace with your server URL

		console.log(socket);

		socket.on("check", (data: any) => {
			console.log(data);
		});

		socket.on("matching", (data: any) => {
			console.log(data);
		});

		if (socket) return () => socket.disconnect();
	}, [])

	const handleMatching = () => {
		// socketio 로 자동 매칭 요청
		const socket = io('http://localhost:3000/game', {
			extraHeaders: {
				Authorization: `Bearer ${localStorage.getItem('token')}`
			}
		});
		socket.emit('check', { msg: 'check' });

	}

	return (
		<Layout pageProps={pageProps}>
			<div className="flex h-full w-full flex-col items-center px-8 py-6">
				{/* 자동 매칭 버튼 */}
				<button onClick={handleMatching} className="bg-zinc-400 w-[50%] text-black h-20 rounded-lg hover:bg-white hover:text-zinc-800" >
					자동 매칭
				</button>
				{/* 게임방 목록 */}
				<div className="container mx-auto py-6">
					<div className="text-2xl font-bold mb-4">
						채팅방 목록
					</div>
					<div className="grid grid-cols-1 gap-4 rounded-lg bg-zinc-400 p-5">
						{/* Replace this array with actual game room data */}
						{gameRoom.map((room, index) => (
							<div key={index} className="bg-zinc-800 text-white p-4 rounded-lg shadow">
								<div className="flex justify-between items-center px-10">
									<span className="font-bold">{room.name}</span>
									<span>{room.mode}</span>
									<span>{room.playerNum} players</span>
									<button className="rounded-lg bg-zinc-400 p-3 hover:bg-zinc-700 transition-colors cursor-pointer">관전하기</button>
								</div>
							</div>
						))}
					</div>
				</div>

			</div>
		</Layout>
	);
}