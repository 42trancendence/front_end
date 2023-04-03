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
	validation_code: string;
}

export default function SignUpPage() {
	const {
		register,
		handleSubmit,
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
				}
				else {
					setLoading(false);
				}
			}
		};

		checkLoginStatus();
	}, [router]);

	const [avatarUrl, setavatarUrl] = useState<string | null>(null);
	const [isValidated2fa, setisValidated2fa] = useState<boolean>(false);
	const [validationCode, setvalidationCode] = useState<string>("");
	let [isOpen, setIsOpen] = useState(false);
	let [dialogText, setDialogText] = useState("");

	//const avatar_bg = useRef<any>();

	// 아바타 이미지 미리보기
	const avatar_bg = useCallback((node: HTMLLabelElement) => {
		if (node !== null) {
			if (avatarUrl) {
				node.style.backgroundImage = `url('${avatarUrl}')`
			} else {
				node.style.backgroundImage = "url('/default_avatar.svg')"
			}
		}
	}, [avatarUrl]);

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

	// 2fa 인증 코드 전송
	const send2faValidationCode = (event: any) => {
		const email = event.target.value;
		console.log(email);
		setisValidated2fa(true);
	};

	// submit
	const onSubmit = async (data: MyFormData) => {
		try {
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("avatar", data.avatar[0]);
			const res = await fetch("http://localhost:3000/auth/signup", {
				headers: {
					"Content-Type": "multipart/form-data",
					Authentication: `Bearer ${localStorage.getItem("token")}`,
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
				<MyDialog dialogText={dialogText} isOpen={isOpen} setIsOpen={setIsOpen} />
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
											maxLength: {
												value: 16,
												message: "16글자를 초과할 수 없습니다.",
											},
										})}
										type="text"
										id="name"
										className="block w-full border-0 bg-zinc-950 px-8 py-6 text-xl text-white shadow-darkbox placeholder:text-lg placeholder:text-gray-200"
										placeholder="사이트에서 표시되는 이름을 정해주세요."
									/>
									<button className="text-md ml-3 inline-flex items-center justify-center whitespace-nowrap rounded bg-zinc-800 px-4 font-semibold tracking-wider text-white shadow">
										중복확인
									</button>
								</div>
								{errors.name && (
									<Alert title="이름을 다시 확인해주세요" messages={[errors.name.message || ""]} />
								)}
								<TabFor2fa tapnames={["Email로 인증", "QR Code로 인증"]}>
									<Tab.Panel className="">
										{!isValidated2fa ? (
											<div className="relative flex w-full max-w-lg flex-col">
												<label htmlFor="validation_email" className="sr-only">
													이메일
												</label>
												<input
													type="text"
													id="validation_email"
													className="block w-full border-0 bg-zinc-950 px-4 py-2.5 text-white shadow-darkbox placeholder:text-gray-400 disabled:text-zinc-400"
													placeholder="이메일"
													value="info@naver.com"
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
												<label htmlFor="validation_code" className="sr-only">
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
												<NormalButton className="ml-3" variant="dark">
													인증
												</NormalButton>
											</div>
										)}
									</Tab.Panel>
									<Tab.Panel className="">test</Tab.Panel>
								</TabFor2fa>
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
