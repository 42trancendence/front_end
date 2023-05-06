import { FC } from 'react'

type Props = {
  onClick: () => void
}

const SlideButton: FC<Props> = ({ onClick }) => {
  return (
    <button className="fixed bottom-[60px] right-[60px] max-w-[200px] min-w-[62px] h-[62px] z-[3] bg-gradient-to-r from-cyan-500 to-blue-500 from-main1 to-main2 rounded-[20px] flex justify-center items-center transition-all duration-300 ease-in-out group px-[17px] hover:pr-[25px]"
    onClick={onClick}
    >
    <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 20 20"
    fill="currentColor"
    aria-hidden="true"
    className="text-white w-6 h-6"
    >
    <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd"/>
    </svg>
    <span className="overflow-hidden inline-flex whitespace-nowrap max-w-0 group-hover:!max-w-[140px] font-semibold group-hover:ml-[12px] transition-all duration-300 ease-in-out">채팅방 생성</span>
  </button>
  )
}

export default SlideButton