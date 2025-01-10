import { useEffect, useRef } from 'react';

type Axis = 'L' | 'H' | 'C';
// type Xy = {x:number, y:number};
type Fx = (input: number) => number;

type GammutGlProps = {
  axisX: Axis;
  axisY: Axis;
  fx: Fx;
};

const GammutGl = ({ axisX, axisY, fx }: GammutGlProps) => {
  const containerRef = useRef<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext('webgl2');
    if (!container || !canvas || !gl) return;
  });
};

export default GammutGl;
