import { useEffect, useRef } from "react";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";

type AxisConfig = "LC" | "HC" | "HL";
// type Xy = {x:number, y:number};
type Fx = (input: number) => number;

type GamutGlProps = {
  axisConfig: AxisConfig;
  fx: Fx;
  resolutionMultiplier: number;
};

const GamutGl = ({
  axisConfig,
  fx,
  resolutionMultiplier = 1,
}: GamutGlProps) => {
  const containerRef = useRef<HTMLDivElement>();
  const canvasRef = useRef<HTMLCanvasElement>();

  useEffect(() => {
    const createShader = (
      gl: WebGL2RenderingContext,
      type: number,
      source: string,
    ) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
      if (!success) {
        console.error("Failed to compile shader:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };
    const createProgram = (
      gl: WebGL2RenderingContext,
      vertexShader: WebGLShader,
      fragmentShader: WebGLShader,
    ) => {
      const program = gl.createProgram();
      if (!program) return null;
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);
      const success = gl.getProgramParameter(program, gl.LINK_STATUS);
      if (!success) {
        console.error("Failed to link program:", gl.getProgramInfoLog(program));
        gl.deleteProgram(program);
        return null;
      }
      return program;
    };

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2");
    if (!container || !canvas || !gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionAttributeLocation = gl.getAttribLocation(
      program,
      "a_position",
    );
    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform2f(
        gl.getUniformLocation(program, "u_resolution"),
        gl.canvas.width,
        gl.canvas.height,
      );
      // 변수 삽입
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width * resolutionMultiplier;
      canvas.height = height * resolutionMultiplier;
      gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
      render();
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);
};

export default GamutGl;
