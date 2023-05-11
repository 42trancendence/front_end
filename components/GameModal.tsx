import React from "react";

export default function GameModal({ visible, onClose, player1Name, player2Name, player1Score, player2Score }) {
	if (!visible) return null;
	return (
		<div className="fixed z-20 inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
		  <div className="bg-white p-2 rounded w-72">
			<h1 className="font-semibold text-center text-xl my-4 text-gray-700">게임 결과</h1>
			<div className="flex flex-col bg-zinc-200">
				<div className="flex justify-center mt-5 text-lg text-zinc-600">
					<a>{`${player1Name}`}</a> <p className="ml-6 font-bold">{player1Score}</p>
				</div>
				<div className="flex justify-center m-2 text-lg text-red-600">
					vs
				</div>
				<div className="flex justify-center mb-5 text-lg text-zinc-600">
					<a>{`${player2Name}`}</a> <p className="ml-6 font-bold">{player2Score}</p>
				</div>
			</div>
			<div className="text-center">
			  <button onClick={onClose} className="px-5 py-2 mt-5 bg-gray-700 text-white rounded">
				확인
			  </button>
			</div>
		  </div>
		</div>
	  );
	}