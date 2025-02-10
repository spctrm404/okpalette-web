import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  OKLAB_TO_NON_LINEAR_LMS,
  LINEAR_LMS_TO_XYZ,
  XYZ_TO_LINEAR_SRGB,
  XYZ_TO_LINEAR_DISPLAY_P3,
  mat3ToGlslMat3,
} from "@/oklab";
import vertex from "./vertex.glsl";
import fragment from "./fragment.glsl";
import st from "./_GamutGl.module.scss";
import classNames from "classnames/bind";

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

const GLSL_VAR_PAIRS = {
  u_OKLAB_TO_NON_LINEAR_LMS: OKLAB_TO_NON_LINEAR_LMS,
  u_LINEAR_LMS_TO_XYZ: LINEAR_LMS_TO_XYZ,
  u_XYZ_TO_LINEAR_SRGB: XYZ_TO_LINEAR_SRGB,
  u_XYZ_TO_LINEAR_DISPLAY_P3: XYZ_TO_LINEAR_DISPLAY_P3,
};

const GamutGl = ({
  lMapping = { mappedTo: "x", flipped: "none", from: 0, to: 1 },
  cMapping = { mappedTo: "y", flipped: "none", from: 0, to: 0.4 },
  hMapping = { mappedTo: "x", flipped: "none", from: 0, to: 360 },
  gamut = "displayP3",
  resolutionMultiplier = 2,
  ...props
}: GamutGlProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const programRef = useRef<WebGLProgram | null>(null);
  const positionBufferRef = useRef<WebGLBuffer | null>(null);

  const memoizedLMapping = useMemo(
    () => lMapping,
    [lMapping.mappedTo, lMapping.flipped, lMapping.from, lMapping.to],
  );
  const memoizedCMapping = useMemo(
    () => cMapping,
    [cMapping.mappedTo, cMapping.flipped, cMapping.from, cMapping.to],
  );
  const memoizedHMapping = useMemo(
    () => hMapping,
    [hMapping.mappedTo, hMapping.flipped, hMapping.from, hMapping.to],
  );

  const render = useCallback((gl: WebGL2RenderingContext) => {
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }, []);

  const updateUniforms = useCallback(
    (gl: WebGL2RenderingContext, program: WebGLProgram) => {
      const pourMapping = (mapping: AxisMapping, prefix: string) => {
        gl.uniform1f(
          gl.getUniformLocation(program, `u_${prefix}MappedTo`),
          AxisValue[mapping.mappedTo],
        );
        gl.uniform1f(
          gl.getUniformLocation(program, `u_${prefix}Flipped`),
          AxisValue[mapping.flipped],
        );
        gl.uniform1f(
          gl.getUniformLocation(program, `u_${prefix}From`),
          mapping.from,
        );
        gl.uniform1f(
          gl.getUniformLocation(program, `u_${prefix}To`),
          mapping.to,
        );
      };
      pourMapping(memoizedLMapping, "l");
      pourMapping(memoizedCMapping, "c");
      pourMapping(memoizedHMapping, "h");

      gl.uniform1f(
        gl.getUniformLocation(program, "u_gamut"),
        gamut === "srgb" ? 0 : 1,
      );
    },
    [memoizedLMapping, memoizedCMapping, memoizedHMapping, gamut],
  );

  const checkGlError = useCallback((gl: WebGL2RenderingContext) => {
    const error = gl.getError();
    if (error !== gl.NO_ERROR) console.error("WebGL Error:", error);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;

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

    gl.clearColor(0, 0, 0, 0);
    gl.disable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
    checkGlError(gl);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertex);
    if (!vertexShader) return;
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragment);
    if (!fragmentShader) return;
    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) {
      gl.deleteShader(vertexShader);
      gl.deleteShader(fragmentShader);
      return;
    }

    if (programRef.current) gl.deleteProgram(programRef.current);
    programRef.current = program;

    gl.useProgram(programRef.current);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    const positionBuffer = gl.createBuffer();
    if (positionBufferRef.current) gl.deleteBuffer(positionBufferRef.current);
    positionBufferRef.current = positionBuffer;

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    const vertices = new Float32Array([
      -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0,
    ]);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    const positionAttribLocation = gl.getAttribLocation(
      programRef.current,
      "a_position",
    );
    gl.enableVertexAttribArray(positionAttribLocation);
    gl.vertexAttribPointer(positionAttribLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(
      gl.getUniformLocation(programRef.current, "u_resolution"),
      gl.canvas.width,
      gl.canvas.height,
    );
    for (const [k, v] of Object.entries(GLSL_VAR_PAIRS)) {
      gl.uniformMatrix3fv(
        gl.getUniformLocation(programRef.current, k),
        false,
        mat3ToGlslMat3(v),
      );
    }
    checkGlError(gl);

    return () => {
      if (programRef.current) {
        const currentProgram = gl.getParameter(gl.CURRENT_PROGRAM);
        if (currentProgram === programRef.current) gl.useProgram(null);
        gl.deleteProgram(programRef.current);
        programRef.current = null;
      }
      if (positionBufferRef.current) {
        gl.deleteBuffer(positionBufferRef.current);
        positionBufferRef.current = null;
      }
    };
  }, [checkGlError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const container = containerRef.current;
    if (!container) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;
    const program = programRef.current;
    if (!program) return;

    const resizeCanvas = () => {
      const { width, height } = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const newWidth = Math.round(width * resolutionMultiplier * dpr);
      const newHeight = Math.round(height * resolutionMultiplier * dpr);
      if (canvas.width === newWidth && canvas.height === newHeight) return;

      canvas.width = newWidth;
      canvas.height = newHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      const resolutionLoc = gl.getUniformLocation(program, "u_resolution");
      gl.uniform2f(resolutionLoc, gl.canvas.width, gl.canvas.height);
      render(gl);
      checkGlError(gl);
    };

    resizeCanvas();

    const resizeObserver = new ResizeObserver(resizeCanvas);
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
    };
  }, [resolutionMultiplier, render, checkGlError]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl2");
    if (!gl) return;
    const program = programRef.current;
    if (!program) return;

    updateUniforms(gl, program);
    render(gl);
    checkGlError(gl);
  }, [render, updateUniforms, checkGlError]);

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
