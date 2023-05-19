// NotifyContext.tsx
import { createContext, useEffect, useState, ReactNode } from "react";

interface NotifyProviderProps {
	children: ReactNode;
}

interface State {
	show: boolean;
	type: string;
	isSuccessed: boolean;
	header: string;
	message: string;
	id?: string;
	avatarImageUrl?: string;
	successed: (info: Info) => void;
	failed: (info: Info) => void;
	close: () => void;

}

export interface Info {
	header: string;
	type: string;
	message: string;
	id?: string;
	avatarImageUrl?: string;
}

const defaultState: State = {
	show: false,
	type: 'global',
	isSuccessed: false,
	header: '',
	message: '',
	id: '',
	avatarImageUrl: '',
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
			type: info.type,
			isSuccessed: true,
			header: info.header,
			message: info.message,
			id: info.id,
			avatarImageUrl: info.avatarImageUrl,
		}));
	};

	// 작업 실패 시 빨간색 알림창을 띄우는 함수
	const failed = (info: Info) => {
		setState((prev) => ({
			...prev,
			show: true,
			type: info.type,
			isSuccessed: false,
			header: info.header,
			message: info.message,
			id: info.id,
			avatarImageUrl: info.avatarImageUrl,
		}));
	};

	// 알림창을 닫는 함수
	const close = () => {
		setState(defaultState);
	};

	const noticeCtx: State = {
		show: state.show,
		type: state.type,
		isSuccessed: state.isSuccessed,
		header: state.header,
		message: state.message,
		id: state.id,
		avatarImageUrl: state.avatarImageUrl,
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
