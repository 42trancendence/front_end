import Seo from "@/components/Seo";
import { useForm } from "react-hook-form";
import { useCallback, useEffect, useRef, useState } from "react";
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
				//router.push("/");
				setLoading(false);
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

	const [avatarUrl, setavatarUrl] = useState<string | null>(null);
	const [isNameDuplicatedPass, setisNameDuplicatedPass] =
		useState<boolean>(false);
	const [is2faNext, setis2faNext] = useState<boolean>(false);
	const [isValidated2fa, setisValidated2fa] = useState<boolean>(false);
	const [validationCode, setvalidationCode] = useState<string>("");
	let [isOpen, setIsOpen] = useState(false);
	let [dialogText, setDialogText] = useState("");
	const [validationEmail, setvalidationEmail] = useState<string>("");

	useEffect(() => {
		const inputEmailValue = async () => {
			await fetch("http://localhost:3000/users/me", {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			}).then((res) =>
				res.json()
				.then((data) => {
					setvalidationEmail(data.email);
				})
				.catch((err) => {
					setvalidationEmail("no email");
				})
			);
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

	// 아바타 사이즈 체크
	function checkSize(event: React.ChangeEvent<HTMLInputElement>) {
		const avatarFile = event.target.files?.[0];
		if (avatarFile) {
			if (avatarFile.size > 5 * 1024 * 1024) {
				alert("아바타 사이즈는 5MB 이내로 등록 가능합니다.");
				setavatarUrl(null);
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
		try {
			const res = await fetch(`http://localhost:3000/users/name/${name}`, {
				method: "GET",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			const data = await res.json();
			if (res.status === 200) {
				setisNameDuplicatedPass(true);
				setDialogText(data.message);
				setIsOpen(true);
			} else if (data.error) {
				setisNameDuplicatedPass(false);
				setDialogText(data.message);
				setIsOpen(true);
			} else {
				setisNameDuplicatedPass(false);
				setDialogText("이름 중복 확인에 실패했습니다.");
				setIsOpen(true);
			}
		} catch (error) {
			console.log(error);
		}
	};

	// 2fa 인증 코드 전송
	const send2faValidationCode = async (event: any) => {
		event.preventDefault();
		try {
			const res = await fetch("http://localhost:3000/2fa/email", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
			});
			if (res.status === 201) {
				setis2faNext(true);
			} else {
				setis2faNext(false);
			}
		} catch (error) {
			console.log(error);
		}
	};

	const validate2faValidationCode = async (event: any) => {
		event.preventDefault();
		try {
			const res = await fetch("http://localhost:3000/2fa/email/turn-on", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				body: JSON.stringify({
					code: validationCode,
				}),
			});
			if (res.status === 201) {
				setisValidated2fa(true);
			} else if (res.status === 404) {
				setisValidated2fa(false);
				setDialogText("2FA 인증 코드가 일치하지 않습니다.");
				setIsOpen(true);
			}
		} catch (error) {
			setisValidated2fa(false);
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
				setDialogText(text);
				setIsOpen(true);
				return;
			}
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("avatar", data.avatar[0]);
			const res = await fetch("http://localhost:3000/auth/signup", {
				headers: {
					"Content-Type": "multipart/form-data",
					Authorization: `Bearer ${localStorage.getItem("token")}`,
				},
				method: "POST",
				body: formData,
			});
			if (res.status === 200) {
				router.push("/lobby/overview");
			} else {
				const errorData = await res.json();
				setDialogText(errorData.message);
				setIsOpen(true);
			}
		} catch (err) {
			setDialogText("회원가입에 실패했습니다.");
			setIsOpen(true);
		}
	};

	return (
		<>
			{loading ? (
				<div>loading...</div>
			) : (
				<>
					<MyDialog
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
											className="text-md ml-3 inline-flex items-center justify-center whitespace-nowrap rounded bg-zinc-800 px-4 font-semibold tracking-wider text-white shadow"
											onClick={() =>
												checkNameDuplication(JSON.stringify(getValues("name")))
											}
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
									{!isValidated2fa ? (
										<TabFor2fa tapnames={["Email로 인증", "QR Code로 인증"]}>
											<Tab.Panel className="">
												{!is2faNext ? (
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
												) : (
													<div className="relative flex w-full max-w-lg">
														<label
															htmlFor="validation_code"
															className="sr-only"
														>
															인증번호
														</label>
														<input
															type="text"
															id="validation_code"
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
															onClick={validate2faValidationCode}
														>
															인증
														</NormalButton>
													</div>
												)}
											</Tab.Panel>
											<Tab.Panel className="">test</Tab.Panel>
										</TabFor2fa>
									) : (
										<div className="m-auto w-full max-w-lg px-2 py-16 sm:px-0">
											<p>2FA 인증 완료</p>
										</div>
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
