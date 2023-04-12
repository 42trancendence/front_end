import Seo from "@/components/Seo";
import { useForm } from "react-hook-form";
import { use, useCallback, useEffect, useRef, useState } from "react";
import TabFor2fa from "@/components/TabFor2fa";
import { Tab } from "@headlessui/react";
import { NormalButton } from "@/components/ui/NormalButton";
import { useRouter } from "next/router";
import {
	isTwoFactorAuthEnabled,
	checkIsLoggedIn,
} from "@/utils/Authentication";
import MyDialog from "@/components/ui/Dialog";
import Alert from "@/components/ui/Alert";
import OneLineInform from "@/components/ui/OneLineInform";
import Loading from "@/components/ui/Loading";
import Image from "next/image";

interface MyFormData {
	avatar: FileList;
	name: string;
	validation_email: string;
	validation_code: string;
}

export default function SignUpPage() {
	const {
		register,
		handleSubmit,
		getValues,
		setValue,
		formState: { errors },
	} = useForm<MyFormData>();

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
				const isValidated2fa = await isTwoFactorAuthEnabled(token);
				if (isValidated2fa === 409) {
					router.push("/lobby/overview");
				} else {
					setLoading(false);
				}
			}
		};

		checkLoginStatus();
	}, [router]);

	// input State
	const [avatarUrl, setavatarUrl] = useState<string | null>(null);
	const [isNameDuplicatedPass, setisNameDuplicatedPass] =
		useState<boolean>(false);
	const [nameLoading, setnameLoading] = useState<boolean>(false);
	// 2fa State
	const [is2faNext, setis2faNext] = useState<"before" | "loading" | "after">(
		"before"
	);
	const [qrCodeImg, setqrCodeImg] = useState<any>(null);
	const [isValidated2fa, setisValidated2fa] = useState<boolean>(false);
	const [validationCode, setvalidationCode] = useState<string>("");
	const [validationEmail, setvalidationEmail] = useState<string>("no email");
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
						"Authorization": `Bearer ${localStorage.getItem("token")}`,
					},
				});
				if (res) {
					let blob = await res.blob();
					let qrImgUrl = URL.createObjectURL(blob);
					let qrImg = () => {
						return <Image src={qrImgUrl} alt="" className="h-48 w-48 rounded shadow" width={500} height={500} />
					}
					setqrCodeImg(qrImg);
				}
			}
			catch (err) {
				console.log(err);
			}
		}
		createQrCode();
	}, []);

	// 이메일 초기화
	useEffect(() => {
		const inputEmailValue = async () => {
			await fetch("http://localhost:3000/users/me", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
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

	// 아바타 이미지 미리보기
	const avatar_bg = useCallback(
		(node: HTMLLabelElement) => {
			if (node !== null) {
				if (avatarUrl) {
					node.style.backgroundImage = `url('${avatarUrl}')`;
				} else {
					node.style.backgroundImage = "url('/default_avatar.svg')";
				}
			}
		},
		[avatarUrl]
	);

	// 아바타 사이즈 체크 & 미리보기 주소 생성
	function checkSize(event: React.ChangeEvent<HTMLInputElement>) {
		const avatarFile = event.target.files?.[0];
		if (avatarFile) {
			if (avatarFile.size > 5 * 1024 * 1024) {
				setavatarUrl(null);
				openDialog("아바타 사이즈는 5MB 이내로 등록 가능합니다.", "fail");
				return;
			}
			const reader = new FileReader();
			reader.onload = (event) => {
				setavatarUrl(event.target?.result as string);
			};
			reader.readAsDataURL(avatarFile);
		} else {
			setavatarUrl(null);
		}
	}

	// 이름 중복 체크
	const checkNameDuplication = async (name: string) => {
		setnameLoading(true);
		try {
			const res = await fetch(
				`http://localhost:3000/users/name?userName=${name}`,
				{
					method: "GET",
					headers: {
						"Content-Type": "application/json",
						"Authorization": `Bearer ${localStorage.getItem("token")}`,
					},
				}
			);
			const data = await res.json();
			setnameLoading(false);
			if (res.status === 200) {
				setisNameDuplicatedPass(true);
				openDialog("사용 가능한 이름입니다.", "success");
			} else if (data.error) {
				setisNameDuplicatedPass(false);
				openDialog(data.message, "fail");
			} else {
				setisNameDuplicatedPass(false);
				openDialog("이름 중복 확인에 실패했습니다.", "fail");
			}
		} catch (error) {
			setnameLoading(false);
			setisNameDuplicatedPass(false);
			openDialog("이름 중복 확인에 실패했습니다.", "fail");
		}
	};

	// 2fa 인증 코드 전송
	const send2faValidationCode = async (event: any) => {
		event.preventDefault();
		setis2faNext("loading");
		try {
			const res = await fetch("http://localhost:3000/2fa/email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
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
			const res = await fetch("http://localhost:3000/2fa/email/turn-on", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					code: validationCode,
				}),
			});
			if (res.status === 201) {
				setisValidated2fa(true);
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
			const res = await fetch("http://localhost:3000/2fa/qrcode/turn-on", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					code: validationCode,
				}),
			});
			if (res.status === 201) {
				setisValidated2fa(true);
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

	// submit
	const onSubmit = async (data: MyFormData) => {
		try {
			if (isNameDuplicatedPass === false || isValidated2fa === false) {
				let text =
					isNameDuplicatedPass === false
						? "- 이름 중복 확인을 해주세요."
						: "- 2FA 인증을 해주세요.";
				openDialog(text, "fail");
				return;
			}
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("avatar", data.avatar[0]);
			const res = await fetch("http://localhost:3000/auth/signup", {
				headers: {
					"Content-Type": "multipart/form-data",
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
				},
				method: "POST",
				body: formData,
			});
			if (res.status === 201) {
				router.push("/lobby/overview");
				setIsOpen;
			} else {
				const errorData = await res.json();
				openDialog(errorData.message, "fail");
				setIsOpen(true);
			}
		} catch (err) {
			openDialog("회원가입에 실패했습니다.", "fail");
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
						<Seo title="Sign Up" />
						<div className="mx-auto max-w-2xl">
							<form onSubmit={handleSubmit(onSubmit)}>
								<div className="flex flex-col items-center justify-center gap-8">
									<div className="mb_8 relative mx-auto w-full text-center">
										<label
											ref={avatar_bg}
											htmlFor="avatar"
											className="group/avatar relative m-auto flex h-36 w-36 cursor-pointer items-center justify-center rounded-full bg-zinc-700 bg-cover bg-center bg-no-repeat bg-origin-content
									 p-2 shadow-md"
										>
											<div className="invisible absolute h-36 w-full rounded-full bg-zinc-700 opacity-50 group-hover/avatar:visible"></div>
											<span className="invisible z-10 w-full font-semibold text-white group-hover/avatar:visible">
												이미지 업로드
											</span>
											<input
												{...register("avatar")}
												type="file"
												id="avatar"
												className="sr-only"
												accept="image/*"
												onChange={checkSize}
											/>
										</label>
									</div>
									<div className="relative flex w-full max-w-lg">
										{nameLoading && <Loading />}
										<label htmlFor="name" className="sr-only">
											이름
										</label>
										<input
											{...register("name", {
												required: "이름을 입력해주세요.",
											})}
											type="text"
											id="name"
											className="block w-full border-0 bg-zinc-950 px-8 py-6 text-xl text-white shadow-darkbox placeholder:text-lg placeholder:text-gray-200"
											placeholder="사이트에서 표시되는 이름을 정해주세요."
										/>
										<button
											type="button"
											className="text-md ml-3 inline-flex items-center justify-center whitespace-nowrap rounded bg-zinc-800 px-4 font-semibold tracking-wider text-white shadow"
											onClick={() => checkNameDuplication(getValues("name"))}
										>
											중복확인
										</button>
									</div>
									{errors.name && (
										<Alert
											title="이름을 다시 확인해주세요"
											messages={[errors.name.message || ""]}
										/>
									)}
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
													<div className="relative flex w-full max-w-lg mt-3">
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
									<input
										className="cursor-pointer border bg-white px-12 py-4 text-lg font-semibold tracking-wider text-zinc-900 shadow-bt shadow-white/40 hover:bg-zinc-100"
										type="submit"
										value="시작하기"
									/>
								</div>
							</form>
						</div>
					</div>
				</>
			)}
		</>
	);
}
