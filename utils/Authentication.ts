export async function isTwoFactorAuthEnabled(token: string) {
	try {
		const res = await fetch('http://localhost:3000/2fa', {
			method: 'GET',
			headers: {
				Authorization: `Bearer ${token}`,
			}, // This is the token
		});
		const data = await res.json();
		return ({
			status: res.status,
			token: data.token,
		});
	} catch (err) {
		console.log(err);
		return ({
			status: 500,
			token: "",
		});
	}
}

export function checkIsLoggedIn() {
	// 로그인 상태 확인하는 함수
	const token = localStorage.getItem("token");
	if (token) {
		return token;
	} else {
		return "";
	}
}
