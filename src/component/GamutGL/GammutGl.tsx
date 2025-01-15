import { useCallback, useEffect, useRef } from "react";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";
import st from "./_GamutGl.module.scss";
import classNames from "classnames";

const cx = classNames.bind(st);

enum AxisValue {
  none = 0,
  x = 1,
  y = 2,
  xy = 3,
}

type AxisMapping = {
  mappedTo: keyof typeof AxisValue;
  flipped: keyof typeof AxisValue;
  from: number;
  to: number;
};

type GamutGlProps = {
  lMapping: AxisMapping;
  cMapping: AxisMapping;
  hMapping: AxisMapping;
  gamut?: "srgb" | "displayP3";
  resolutionMultiplier?: number;
  className?: string;
};

const GamutGl = ({
  lMapping = { mappedTo: "x", flipped: "none", from: 0, to: 1 },
  cMapping = { mappedTo: "y", flipped: "none", from: 0, to: 0.4 },
  hMapping = { mappedTo: "x", flipped: "none", from: 0, to: 360 },
  gamut = "displayP3",
  resolutionMultiplier = 4,
  ...props
}: GamutGlProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const render = useCallback((gl: WebGL2RenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);
  const updateUniforms = useCallback(
    (gl: WebGL2RenderingContext, program: WebGLProgram) => {
      gl.uniform2f(
        gl.getUniformLocation(program!, "u_resolution"),
        gl.canvas.width,
        gl.canvas.height,
      );

      const pourMapping = (mapping: AxisMapping, prefix: string) => {
        gl.uniform1f(
          gl.getUniformLocation(program!, `u_${prefix}MappedTo`),
          AxisValue[mapping.mappedTo],
        );
        gl.uniform1f(
          gl.getUniformLocation(program!, `u_${prefix}Flipped`),
          AxisValue[mapping.flipped],
        );
        gl.uniform1f(
          gl.getUniformLocation(program!, `u_${prefix}From`),
          mapping.from,
        );
        gl.uniform1f(
          gl.getUniformLocation(program!, `u_${prefix}To`),
          mapping.to,
        );
      };

      pourMapping(lMapping, "l");
      pourMapping(cMapping, "c");
      pourMapping(hMapping, "h");

      gl.uniform1f(
        gl.getUniformLocation(program!, "u_gamut"),
        gamut === "srgb" ? 0 : 1,
      );
    },
    [lMapping, cMapping, hMapping, gamut],
  );

  // Initialize WebGL
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const gl = canvas?.getContext("webgl2");
    if (!canvas || !container || !gl) return;

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

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
    if (!vertexShader || !fragmentShader) return;

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

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    gl.useProgram(program);
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionAttribLocation = gl.getAttribLocation(program, "a_position");
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);
  }, []);

  // Update uniforms and render
  useEffect(() => {
    const canvas = canvasRef.current;
    const gl = canvas?.getContext("webgl2");
    if (!canvas || !gl) return;

    const program = gl.getParameter(gl.CURRENT_PROGRAM);
    if (!program) return;

    updateUniforms(gl, program);
    render(gl);
  }, [render, updateUniforms]);

  // Resize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    const gl = canvas?.getContext("webgl2");
    if (!canvas || !container || !gl) return;

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      canvas.width = width * resolutionMultiplier;
      canvas.height = height * resolutionMultiplier;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      gl.viewport(0, 0, canvas.width, canvas.height);
      render(gl);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [render, resolutionMultiplier]);

  return (
    <div
      className={cx("gamut-gl-container", props.className)}
      ref={containerRef}
    >
      <canvas className={cx("gamut-gl")} ref={canvasRef} />
    </div>
  );
};

export default GamutGl;
