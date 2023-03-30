import Seo from "@/components/Seo";
import { useForm } from "react-hook-form";
import { useEffect, useRef, useState } from "react";
import TabFor2fa from "@/components/TabFor2fa";
import { Tab } from "@headlessui/react";
import { NormalButton } from "@/components/ui/NormalButton";
import { useRouter } from "next/router";
import { isTwoFactorAuthEnabled, checkIsLoggedIn } from "@/utils/Authentication";

interface MyFormData {
	avatar: FileList;
	name: string;
	validation_code: string;
}

export default function SignUpPage({token}: {token?:string}) {
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<MyFormData>();

	const router = useRouter();

	const [loading, setLoading] = useState(true);
	useEffect(() => {
		const checkLoginStatus = async () => {
			// 로그인 상태 확인하는 비동기 함수
			const isLoggedIn = await checkIsLoggedIn();

			if (!isLoggedIn) {
				router.push("/");
			}
			else {
				const isValidated2fa = await isTwoFactorAuthEnabled(isLoggedIn);
				if (isValidated2fa === 409) {
					router.push("/lobby/overview");
				}
				setLoading(false);
			}

		};

		checkLoginStatus();
	}, [router]);

	const [avatarUrl, setavatarUrl] = useState<string | null>(null);
	const [isValidated2fa, setisValidated2fa] = useState<boolean>(false);
	const [validationCode, setvalidationCode] = useState<string>("");
	const avatar_bg = useRef<any>();

	// useEffect : 아바타 미리보기 이미지 변경
	useEffect(() => {
		if (avatarUrl) {
			avatar_bg.current.style.backgroundImage = `url('${avatarUrl}')`;
		} else {
			avatar_bg.current.style.backgroundImage = "url('/default_avatar.svg')";
		}
	}, [avatarUrl]);

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

	const send2faValidationCode = (event: any) => {
		const email = event.target.value;
		console.log(email);
		setisValidated2fa(true);
	};

	const onSubmit = async (data: MyFormData) => {
		try {
			const formData = new FormData();
			formData.append("name", data.name);
			formData.append("avatar", data.avatar[0]);
			const res = await fetch("http://localhost:3000/auth/signup", {
				headers: {
					"Content-Type": "multipart/form-data",
					"Authentication": `Bearer ${token}`,
				},
				method: "POST",
				body: formData,
			});
			if (res.status === 200) {
				router.push("/lobby/oveirview");
			} else {
				alert("회원가입에 실패했습니다.");
			}
		} catch (err) {
			console.log(err);
		}
	};

	return (
		<div className="relative isolate overflow-hidden py-32 sm:py-48 lg:py-56">
			<Seo title="Sign Up" />
			<div className="mx-auto max-w-2xl">
				<form onSubmit={handleSubmit(onSubmit)}>
					<div className="flex flex-col items-center justify-center gap-8">
						<div className="mb_8 relative mx-auto w-full text-center">
							<label
								ref={avatar_bg}
								htmlFor="avatar"
								className={`group/avatar relative m-auto flex h-36 w-36 cursor-pointer items-center justify-center rounded-full bg-zinc-700 bg-cover bg-center bg-no-repeat bg-origin-content
									 p-2 shadow-md`}
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
									required: true,
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
						<TabFor2fa tapnames={["QR Code", "Email"]}>
							<Tab.Panel className="">test</Tab.Panel>
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
											{...register("validation_code", {
												required: true,
												maxLength: {
													value: 6,
													message: "유효하지 않은 인증번호 입니다.",
												},
											})}
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
	);
}
