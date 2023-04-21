import { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import Loading from "./ui/Loading";
import MyDialog from "./ui/Dialog";
import { Dialog } from "@headlessui/react";

interface MyFormData {
	avatar: FileList;
	name: string;
}

const EditProfilePallet = ({
	isOpen,
	setIsOpen,
}: {
	isOpen: boolean;
	setIsOpen: any;
}) => {
	const {
		register,
		handleSubmit,
		getValues,
		formState: { errors },
	} = useForm<MyFormData>();
	// input State
	const [avatarUrl, setavatarUrl] = useState<string | null>(null);
	const [isNameDuplicatedPass, setisNameDuplicatedPass] =
		useState<boolean>(false);
	const [nameLoading, setnameLoading] = useState<boolean>(false);

	// 팝업 State
	let [isNameDupOpen, setisNameDupOpen] = useState(false);
	let [dialogState, setDialogState] = useState<"success" | "fail">("fail");
	let [dialogText, setDialogText] = useState("");
	function openDialog(message: string, state: "success" | "fail") {
		setDialogText(message);
		setDialogState(state);
		setisNameDupOpen(true);
	}
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
						Authorization: `Bearer ${localStorage.getItem("token")}`,
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

	// submit
	const onSubmit = async (data: MyFormData) => {
		try {
			if (isNameDuplicatedPass === false) {
				let text = "- 이름 중복 확인을 해주세요.";
				openDialog(text, "fail");
				return;
			}
			const formData = new FormData();
			formData.append("name", data.name);
			//formData.append("avatar", data.avatar[0]);
			const res = await fetch("http://localhost:3000/users/me", {
				headers: {
					"Content-Type": "application/json",
					"Authorization": `Bearer ${localStorage.getItem("token")}`,
				},
				method: "PUT",
				body: formData,
			});
			if (res.status === 201) {
				setIsOpen(false);
			} else {
				const errorData = await res.json();
				openDialog(errorData.message, "fail");
				setIsOpen(true);
			}
		} catch (err) {
			openDialog("프로필 업데이트에 실패했습니다.", "fail");
		}
	};
	return (
		<Dialog
			open={isOpen}
			onClose={() => setIsOpen(false)}
			className="relative z-50"
		>
			<MyDialog
				type={dialogState}
				dialogTitle="프로필 수정"
				dialogText={dialogText}
				isOpen={isNameDupOpen}
				setIsOpen={setisNameDupOpen}
			/>
			<div
				className="fixed inset-0 bg-zinc-900 bg-opacity-90 transition-opacity"
				aria-hidden="true"
			/>
			<div className="fixed inset-0 z-10 overflow-y-auto">
				<div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
					<Dialog.Panel className="relative overflow-hidden rounded-lg bg-zinc-800 px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
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
										className="block w-full border-0 bg-zinc-950 px-8 py-6 text-xl text-white shadow-darkbox placeholder:text-lg placeholder:text-zinc-300"
										placeholder="이름을 입력해주세요"
									/>
									<button
										type="button"
										className="text-md ml-3 inline-flex items-center justify-center whitespace-nowrap rounded bg-white px-4 font-semibold tracking-wider text-zinc-900 shadow"
										onClick={() => checkNameDuplication(getValues("name"))}
									>
										중복확인
									</button>
								</div>
								<div className="mt-5 flex gap-2 sm:mt-4">
									<button
										className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-zinc-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
										type="submit"
									>
									저장하기
									</button>
									<button
										type="button"
										className="mt-3 inline-flex w-full justify-center rounded-md bg-zinc-800 px-3 py-2 text-sm font-semibold text-zinc-100 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-zinc-700 sm:mt-0 sm:w-auto"
										onClick={() => setIsOpen(false)}
									>
										닫기
									</button>
								</div>
							</div>
						</form>
					</Dialog.Panel>
				</div>
			</div>
		</Dialog>
	);
};

export default EditProfilePallet;
