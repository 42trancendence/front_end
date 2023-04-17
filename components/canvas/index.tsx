import React, { RefObject, useEffect, useRef, useState, useContext } from 'react'
import { GameSocketContext } from '@/lib/socketContext';

const Canvas: React.FC = () => {
  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [rectY1, setRectY1] = useState(0);
  const [rectY2, setRectY2] = useState(0);

  // 컨텍스트 세팅
  useEffect(() => {
    if (canvasRef?.current) {
      const canvas = canvasRef.current;
      const context = canvas.getContext('2d');
      
      setCtx(context);
    }
  }, [canvasRef]);

  // 소켓 연결(컨텍스트 세팅, socket.id 가 초기화 되는지 확인 필요)
	const { socket } = useContext(GameSocketContext);
  useEffect(() => {
    console.log(socket);
    if (socket) {
      socket.on('gaming', (data) => {
        console.log(data);
      })
    }
  }, [socket])

  // 컨텍스트가 세팅되면 그림 그리기
  useEffect(() => {
    if (ctx) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, 500, 500);
    };

    // setInterval(() => {
      render();
    // }, 1000);
  }, [ctx]);

  useEffect(() => {
    render();
  }, [rectY1]);
  
  // useEffect(() => {
  //   // setRectX(rectX + 1);
  //   render(rectX);
  // });
  
  const render = () => {
    if (ctx) {
      // x1 += 1;
      // x2 -= 1;
      ctx.clearRect(0, 0, 500, 500);
      drawRect(0);
      drawRect(500-10);
      drawCircle();
      drawText();
    }
  }
  
  const drawRect = (rectX: number) => {
    if (ctx) {
      ctx.fillStyle = 'red';
      ctx.fillRect(rectX, rectY1, 10, 100);
    }
  }
  
  const drawCircle = () => {
    if (ctx) {
      ctx.beginPath();
      ctx.arc(250, 250, 10, 0, 2 * Math.PI);
      ctx.fillStyle = 'blue';
      ctx.fill();
    }
  }
  
  const drawText = () => {
    if (ctx) {
      ctx.font = '30px Arial';
      ctx.fillStyle = 'white';
      ctx.fillText('Hello World', 100, 100);
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    console.log(e.key);
    if (e.key === 'ArrowLeft') {
      console.log(rectY1);
      setRectY1(rectY1 - 10);
    } else if (e.key === 'ArrowRight') {
      console.log(rectY1);
      setRectY1(rectY1 + 10);
    } 
  }

  return (
    <div
      tabIndex={0} // 키보드 포커스를 위한 tabIndex 설정
      style={{ outline: 'none' }} // 선택시 브라우저가 테두리를 그리지 않도록 함
      onKeyDown={handleKeyDown} // 함수 자체를 전달
    >
      <canvas 
        ref={canvasRef} width={500} height={500}
        />
    </div>
  )
}

export default Canvas