import { useCallback, useEffect, useRef, useState } from "react";
import st from "./_Test.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

type ColorSpace = "srgb" | "srgb-linear" | "display-p3" | "oklch";

const Test = () => {
  const createSwatch = (
    key: string,
    colorSpace: ColorSpace,
    lightness: number,
  ) => {
    return (
      <div
        key={key}
        className={cx("swatch")}
        style={{
          backgroundColor:
            colorSpace === "oklch"
              ? `oklch(${100 * lightness}% 0 0deg)`
              : `color(${colorSpace} ${lightness} ${lightness} ${lightness})`,
        }}
      ></div>
    );
  };

  const createSwatches = (colorSpace: ColorSpace, num: number) => {
    const swatches = [];
    const uuid = crypto.randomUUID;
    for (let n = 0; n < num; n++) {
      swatches.push(
        createSwatch(`swatch_${uuid}_${n}`, colorSpace, n / (num - 1)),
      );
    }
    return swatches;
  };

  const checkerTileCanvasRef1 = useRef<HTMLCanvasElement>(null);
  const checkerTileCanvasRef2 = useRef<HTMLCanvasElement>(null);
  const checkerTileCanvasRef3 = useRef<HTMLCanvasElement>(null);
  const checkerTileCanvasRef4 = useRef<HTMLCanvasElement>(null);
  const checkerTileCanvasRef5 = useRef<HTMLCanvasElement>(null);
  const checkerTileCanvasRef6 = useRef<HTMLCanvasElement>(null);

  const drawCheckerTile = (
    canvasRef: React.RefObject<HTMLCanvasElement>,
    checkerTileSize: number,
    lightness: number,
  ) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const { width, height } = parent.getBoundingClientRect();
    if (!width || !height) return;

    canvas.width = width;
    canvas.height = height;

    const checkerTile = (x: number, y: number) => {
      ctx.fillRect(
        x,
        y,
        checkerTileSize * lightness,
        checkerTileSize * lightness,
      );
      ctx.fillRect(
        x - checkerTileSize * lightness,
        y - checkerTileSize * lightness,
        checkerTileSize * lightness,
        checkerTileSize * lightness,
      );
    };

    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rowMax = Math.ceil(canvas.height / checkerTileSize);
    const columnMax = Math.ceil(canvas.width / checkerTileSize);
    ctx.fillStyle = "rgb(0, 0, 0)";
    for (let row = -1; row < rowMax + 1; row++) {
      const y = row * checkerTileSize;
      for (let column = -1; column < columnMax + 1; column++) {
        const x = column * checkerTileSize;
        checkerTile(x, y);
      }
    }

    return ctx;
  };

  useEffect(() => {
    drawCheckerTile(checkerTileCanvasRef1, 2, 1);
    drawCheckerTile(checkerTileCanvasRef2, 2, 0.5);
    drawCheckerTile(checkerTileCanvasRef3, 2, 0);
    drawCheckerTile(checkerTileCanvasRef4, 2, 1);
    drawCheckerTile(checkerTileCanvasRef5, 2, 0.5);
    drawCheckerTile(checkerTileCanvasRef6, 2, 0);
  }, []);

  const [srgb, setSrgb] = useState(0);

  return (
    <>
      <p>cheker</p>
      <div className={cx("palette")}>
        <div className={cx("swatch")}>
          <canvas ref={checkerTileCanvasRef1}></canvas>
        </div>
        <div className={cx("swatch")}>
          <canvas ref={checkerTileCanvasRef2}></canvas>
        </div>
        <div className={cx("swatch")}>
          <canvas ref={checkerTileCanvasRef3}></canvas>
        </div>
      </div>
      <div>
        <div
          style={{
            height: "88px",
            backgroundColor: `color(srgb ${srgb} ${srgb} ${srgb})`,
            position: "relative",
            top: "-16px",
          }}
        ></div>
        <div
          style={{
            height: "88px",
            backgroundColor: `color(srgb-linear 0.5 0.5 0.5)`,
            position: "relative",
            top: "-16px",
          }}
        ></div>
        <div>
          <input
            type="range"
            value={srgb}
            min={0}
            max={1}
            step={0.001}
            onChange={(e) => {
              setSrgb(Number(e.currentTarget.value));
            }}
          />
          <span>{srgb}</span>
        </div>
      </div>
      <p>srgb-linear</p>
      <div className={cx("palette")}>{createSwatches("srgb-linear", 3)}</div>
      <p>cheker-blurred</p>
      <div className={cx("palette")}>
        <div className={cx("swatch")}>
          <canvas
            ref={checkerTileCanvasRef4}
            style={{ filter: "blur(4px)" }}
          ></canvas>
        </div>
        <div className={cx("swatch")}>
          <canvas
            ref={checkerTileCanvasRef5}
            style={{ filter: "blur(4px)" }}
          ></canvas>
        </div>
        <div className={cx("swatch")}>
          <canvas
            ref={checkerTileCanvasRef6}
            style={{ filter: "blur(4px)" }}
          ></canvas>
        </div>
      </div>
      <p>srgb</p>
      <div className={cx("palette")}>{createSwatches("srgb", 3)}</div>
      <p>oklch</p>
      <div className={cx("palette")}>{createSwatches("oklch", 3)}</div>
      <p>display-p3</p>
      <div className={cx("palette")}>{createSwatches("display-p3", 3)}</div>
      <p>srgb</p>
      <div className={cx("palette")}>{createSwatches("srgb", 21)}</div>
      <p>oklch</p>
      <div className={cx("palette")}>{createSwatches("oklch", 21)}</div>
      <p>display-p3</p>
      <div className={cx("palette")}>{createSwatches("display-p3", 21)}</div>
      <p>srgb</p>
      <div className={cx("palette")}>{createSwatches("srgb", 1001)}</div>
      <p>oklch</p>
      <div className={cx("palette")}>{createSwatches("oklch", 1001)}</div>
      <p>display-p3</p>
      <div className={cx("palette")}>{createSwatches("display-p3", 1001)}</div>
    </>
  );
};

export default Test;
