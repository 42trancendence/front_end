// NotifyContext.tsx
import { createContext, useEffect, useState, ReactNode } from "react";

interface NotifyProviderProps {
	children: ReactNode;
}

interface State {
	show: boolean;
	isSuccessed: boolean;
	header: string;
	message: string;
	id?: string;
	successed: (info: Info) => void;
	failed: (info: Info) => void;
	close: () => void;

}

export interface Info {
	header: string;
	message: string;
	id?: string;
}

const defaultState: State = {
	show: false,
	isSuccessed: false,
	header: '',
	message: '',
	id: '',
	successed: (info: Info) => { },
	failed: (info: Info) => { },
	close: () => { },
};

const NotifyContext = createContext(defaultState);

const NotifyProvider = ({ children }: NotifyProviderProps) => {
	const [state, setState] = useState(defaultState);

	// 작업 성공 시 초록색 알림창을 띄우는 함수
	const successed = (info: Info) => {
		setState((prev) => ({
			...prev,
			show: true,
			isSuccessed: true,
			header: info.header,
			message: info.message,
			id: info.id,
		}));
	};

	// 작업 실패 시 빨간색 알림창을 띄우는 함수
	const failed = (info: Info) => {
		setState((prev) => ({
			...prev,
			show: true,
			isSuccessed: false,
			header: info.header,
			message: info.message,
			id: info.id,
		}));
	};

	// 알림창을 닫는 함수
	const close = () => {
		setState(defaultState);
	};

	const noticeCtx: State = {
		show: state.show,
		isSuccessed: state.isSuccessed,
		header: state.header,
		message: state.message,
		id: state.id,
		successed,
		failed,
		close,
	};

	return (
		<NotifyContext.Provider value={ noticeCtx }>
			{children}
		</NotifyContext.Provider>
	);
};

export {
	NotifyContext,
	NotifyProvider,
};
