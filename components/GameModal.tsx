import React from "react";

export default function GameModal({ visible, onClose }) {
	if (!visible) return null;
	return (
		<div className="fixed z-20 inset-0 bg-black bg-opacity-25 backdrop-blur-sm flex items-center justify-center">
		  <div className="bg-white p-2 rounded w-72">
			<h1 className="font-semibold text-center text-xl my-4 text-gray-700">게임 결과</h1>
			<div className="flex flex-col bg-zinc-200">
			  	<div className="flex justify-center mt-5 text-lg text-zinc-600">
					<a>승자: player1 </a> <p className="ml-6 font-bold">20점</p>
				</div>
			  	<div className="flex justify-center mb-5 text-lg text-zinc-600">
					<a>패자: player2</a> <p className="ml-6 font-bold">10점</p>
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