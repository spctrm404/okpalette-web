import { useEffect, useRef } from "react";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";
import st from "./_GamutGl.module.scss";
import classNames from "classnames";

const cx = classNames.bind(st);

type AxisMapping = {
  mappedTo: "x" | "y";
  flipped: boolean;
};

type GamutGlProps = {
  lMapping: AxisMapping;
  cMapping: AxisMapping;
  hMapping: AxisMapping;
  hues: { from: number; to: number };
  gamut?: "srgb" | "displayP3";
  resolutionMultiplier?: number;
  boundaryChkCDelta?: number;
  className?: string;
};

const GamutGl = ({
  lMapping = { mappedTo: "x", flipped: false },
  cMapping = { mappedTo: "y", flipped: false },
  hMapping = { mappedTo: "x", flipped: false },
  hues,
  gamut = "displayP3",
  resolutionMultiplier = 1,
  boundaryChkCDelta = 0.002,
  ...props
}: GamutGlProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const createShader = (
      gl: WebGL2RenderingContext,
      type: number,
      source: string,
    ): WebGLShader | null => {
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
    ): WebGLProgram | null => {
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

    const canvas = canvasRef.current;
    const container = containerRef.current;
    const gl = canvas?.getContext("webgl2");
    if (!canvas || !container || !gl) return;

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    console.log("GamutGl");
    gl.useProgram(program);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionLocation = gl.getAttribLocation(program, "a_Position");
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    const render = () => {
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.uniform2f(
        gl.getUniformLocation(program!, "u_Resolution"),
        gl.canvas.width,
        gl.canvas.height,
      );
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_LMappedTo"),
        lMapping.mappedTo === "x" ? 0 : 1,
      );
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_LFlipped"),
        lMapping.flipped ? 1 : 0,
      );
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_CMappedTo"),
        cMapping.mappedTo === "x" ? 0 : 1,
      );
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_CFlipped"),
        cMapping.flipped ? 1 : 0,
      );
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_HMappedTo"),
        hMapping.mappedTo === "x" ? 0 : 1,
      );
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_HFlipped"),
        hMapping.flipped ? 1 : 0,
      );
      gl.uniform1f(gl.getUniformLocation(program!, "u_HDegFrom"), hues.from);
      gl.uniform1f(gl.getUniformLocation(program!, "u_HDegTo"), hues.to);
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_Gamut"),
        gamut === "srgb" ? 0 : 1,
      );
      gl.uniform1f(
        gl.getUniformLocation(program!, "u_BoundaryChkCDelta"),
        boundaryChkCDelta,
      );

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
  }, [
    lMapping,
    cMapping,
    hMapping,
    hues,
    gamut,
    resolutionMultiplier,
    boundaryChkCDelta,
  ]);

  return (
    <div
      className={cx("gamut-gl-container", props.className)}
      style={{ width: "300px", height: "300px" }}
      ref={containerRef}
    >
      <canvas className={cx("gamut-gl")} ref={canvasRef} />
    </div>
  );
};

export default GamutGl;
