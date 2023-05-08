import Seo from "@/components/Seo";
import { useEffect, useState } from "react";
import TabFor2fa from "@/components/TabFor2fa";
import { Tab } from "@headlessui/react";
import { NormalButton } from "@/components/ui/NormalButton";
import { useRouter } from "next/router";
import {
	isTwoFactorAuthEnabled,
	checkIsLoggedIn,
} from "@/utils/Authentication";
import MyDialog from "@/components/ui/Dialog";
import OneLineInform from "@/components/ui/OneLineInform";
import Loading from "@/components/ui/Loading";
import Image from "next/image";
import axios from "axios";

export default function TwoFAPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(true);

	// useEffect : 로그인 상태 확인
	useEffect(() => {
		const checkLoginStatus = async () => {
			// 로그인 상태 확인하는 비동기 함수
			const token = await checkIsLoggedIn();

			if (!token) {
				router.push("/");
			} else {
				const twofaStauts = await isTwoFactorAuthEnabled(token);
				if (twofaStauts.status !== 200) {
					router.push("/lobby/overview");
				} else {
					setLoading(false);
				}
			}
		};

		checkLoginStatus();
	}, [router]);

	// 2fa State
	const [is2faNext, setis2faNext] = useState<"before" | "loading" | "after">(
		"before"
	);
	const [qrCodeImg, setqrCodeImg] = useState<any>(null);
	const [isValidated2fa, setisValidated2fa] = useState<boolean>(false);
	const [validationCode, setvalidationCode] = useState<string>("");
	const [validationEmail, setvalidationEmail] = useState<string>("42 intra에 저장된 이메일로 인증코드가 전송됩니다.");
	// 팝업 State
	let [isOpen, setIsOpen] = useState(false);
	let [dialogState, setDialogState] = useState<"success" | "fail">("fail");
	let [dialogText, setDialogText] = useState("");
	function openDialog(message: string, state: "success" | "fail") {
		setDialogText(message);
		setDialogState(state);
		setIsOpen(true);
	}

	// qr code 생성
	useEffect(() => {
		const createQrCode = async () => {
			try {
				let res = await fetch("http://localhost:3000/2fa/qrcode", {
					method: "POST",
					headers: {
						Authorization: `Bearer ${localStorage.getItem("token")}`,
					},
				});
				if (res) {
					let blob = await res.blob();
					let qrImgUrl = URL.createObjectURL(blob);
					let qrImg = () => {
						return (
							<Image
								src={qrImgUrl}
								alt=""
								className="h-48 w-48 rounded shadow"
								width={500}
								height={500}
							/>
						);
					};
					setqrCodeImg(qrImg);
				}
			} catch (err) {
				console.log(err);
			}
		};
		createQrCode();
	}, []);

	/*
	// 이메일 초기화
	useEffect(() => {
		const inputEmailValue = async () => {
			await fetch("http://localhost:3000/users/me", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			})
				.then((res) =>
					res
						.json()
						.then((data) => {
							setvalidationEmail(data.email);
						})
						.catch((err) => {
							console.log(err);
							setvalidationEmail("no email");
						})
				)
				.catch((err) => {
					console.log(err);
					setvalidationEmail("no email");
				});
		};

		inputEmailValue();
	}, []);
	*/

	// 2fa 인증 코드 전송
	const send2faValidationCode = async (event: any) => {
		event.preventDefault();
		setis2faNext("loading");
		try {
			const res = await fetch("http://localhost:3000/2fa/email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			if (res.status === 201) {
				setis2faNext("after");
			} else {
				setis2faNext("before");
			}
		} catch (error) {
			console.log(error);
			setis2faNext("before");
		}
	};

	// 2fa 인증 코드 검증 email
	const validate2faValidationCode_email = async (event: any) => {
		event.preventDefault();
		try {
			const res = await axios("http://localhost:3000/2fa/email/turn-on", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				data: {
					code: validationCode,
				},
			});
			const data = await res.data;
			if (res.status === 201) {
				setisValidated2fa(true);
				localStorage.setItem("token", data.token);
				router.replace("/lobby/overview");
			} else if (res.status === 404) {
				setisValidated2fa(false);
				openDialog("2FA 인증 코드가 일치하지 않습니다.", "fail");
			}
		} catch (error) {
			setisValidated2fa(false);
			openDialog("2FA 인증에 실패했습니다.", "fail");
			console.log(error);
		}
	};

	// 2fa 인증 코드 검증 google qrcode
	const validate2faValidationCode_qr = async (event: any) => {
		event.preventDefault();
		try {
			const res = await axios("http://localhost:3000/2fa/qrcode/turn-on", {
				method: "post",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				data: {
					code: validationCode,
				},
			});
			const data = await res.data;
			if (res.status === 201) {
				setisValidated2fa(true);
				localStorage.setItem("token", data.token);
				router.replace("/lobby/overview");
			} else if (res.status === 404) {
				setisValidated2fa(false);
				openDialog("2FA 인증 코드가 일치하지 않습니다.", "fail");
			}
		} catch (error) {
			setisValidated2fa(false);
			openDialog("2FA 인증에 실패했습니다.", "fail");
		}
	};

	return (
		<>
			{loading ? (
				<Loading />
			) : (
				<>
					<MyDialog
						type={dialogState}
						dialogTitle="회원가입"
						dialogText={dialogText}
						isOpen={isOpen}
						setIsOpen={setIsOpen}
					/>
					<div className="relative isolate overflow-hidden py-32 sm:py-48 lg:py-56">
						<Seo title="2FA 인증" />
						<div className="mx-auto max-w-2xl">
							<div>
								<div className="flex flex-col items-center justify-center gap-8">
									<div className="relative mt-8 w-full max-w-lg">
										<div
											className="absolute inset-0 flex items-center"
											aria-hidden="true"
										>
											<div className="w-full border-t border-zinc-300" />
										</div>
										<div className="relative flex justify-start">
											<span className="bg-zinc-900 pr-3 text-base font-semibold leading-6 text-white">
												2FA 인증
											</span>
										</div>
									</div>
									{!isValidated2fa ? (
										<>
											<TabFor2fa tapnames={["Email", "QR Code"]}>
												{is2faNext === "loading" && <Loading />}
												<Tab.Panel>
													{(is2faNext === "before" ||
														is2faNext === "loading") && (
														<div className="relative flex w-full max-w-lg flex-col">
															<label
																htmlFor="validation_email"
																className="sr-only"
															>
																이메일
															</label>
															<input
																type="text"
																id="validation_email"
																className="block w-full border-0 bg-zinc-950 px-4 py-2.5 text-white shadow-darkbox placeholder:text-gray-400 disabled:text-zinc-400"
																placeholder="이메일"
																value={validationEmail}
																readOnly
															/>
															<NormalButton
																className="mt-3"
																variant="dark"
																onClick={send2faValidationCode}
															>
																인증번호 전송
															</NormalButton>
														</div>
													)}
													{is2faNext === "after" && (
														<div className="relative flex w-full max-w-lg">
															<label
																htmlFor="validation_code_email"
																className="sr-only"
															>
																인증번호
															</label>
															<input
																type="text"
																id="validation_code_email"
																className="block w-full border-0 bg-zinc-950 px-4 py-2.5 text-white shadow-darkbox placeholder:text-gray-400"
																placeholder="인증번호"
																value={validationCode}
																onChange={(e) => {
																	setvalidationCode(e.target.value);
																}}
															/>
															<NormalButton
																className="ml-3"
																variant="dark"
																onClick={validate2faValidationCode_email}
															>
																인증
															</NormalButton>
														</div>
													)}
												</Tab.Panel>
												<Tab.Panel>
													<div className="relative flex w-full max-w-lg flex-col">
														<div className="flex justify-center">
															{qrCodeImg}
														</div>
														<div className="relative mt-3 flex w-full max-w-lg">
															<label
																htmlFor="validation_code_qrcode"
																className="sr-only"
															>
																인증번호
															</label>
															<input
																type="text"
																id="validation_code_qrcode"
																className="block w-full border-0 bg-zinc-950 px-4 py-2.5 text-white shadow-darkbox placeholder:text-gray-400"
																placeholder="인증번호"
																value={validationCode}
																onChange={(e) => {
																	setvalidationCode(e.target.value);
																}}
															/>
															<NormalButton
																className="ml-3"
																variant="dark"
																onClick={validate2faValidationCode_qr}
															>
																인증
															</NormalButton>
														</div>
													</div>
												</Tab.Panel>
											</TabFor2fa>
										</>
									) : (
										<OneLineInform
											type="success"
											message="2FA 인증이 완료되었습니다!"
										/>
									)}
								</div>
							</div>
						</div>
					</div>
				</>
			)}
		</>
	);
}
