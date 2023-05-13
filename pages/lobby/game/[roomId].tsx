import Layout from "@/components/Layout";
import { ReactElement } from "react";
import {
	SocketProvider,
} from "@/lib/socketContext";
import Seo from "@/components/Seo";
import Canvas from "@/components/canvas/canvas";
import { useContext, useEffect } from "react";
import { SocketContext } from "@/lib/socketContext";

const GameView = () => {
	const { friendSocket } = useContext(SocketContext);
	useEffect(() => {
		if (friendSocket) {
			friendSocket.emit("updateActiveStatus", 3);
		}
	}, [friendSocket]);

	return (
		<>
			<Seo title="GameView" />
			<Canvas></Canvas>
		</>
	);
};

GameView.getLayout = function getLayout(page: ReactElement) {
	return (
		<SocketProvider>
      <Layout>{page}</Layout>
		</SocketProvider>
	);
};

export default GameView;
