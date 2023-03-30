export async function isTwoFactorAuthEnabled(token: string) {
	const res = await fetch('http://localhost:3000/2fa', {
		method: 'GET',
		headers: {
			Authorization: `Bearer ${token}`,
		}, // This is the token
	});

	if (res.status === 200) {
		return true;
	} else {
		return false;
	}
}

export function checkIsLoggedIn() {
	// 로그인 상태 확인하는 함수
	const token = localStorage.getItem("token");
	if (token) {
		return true;
	} else {
		return false;
	}
}
