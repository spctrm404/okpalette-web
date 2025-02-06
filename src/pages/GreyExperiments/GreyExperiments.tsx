import { useCallback, useEffect, useRef, useState } from "react";
import st from "./_GreyExperiments.module.scss";
import classNames from "classnames/bind";

const cx = classNames.bind(st);

type ColorSpace = "srgb" | "srgb-linear" | "display-p3" | "oklch";

const GreyExperiments = () => {
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

  const checkerTileCanvasesRef = useRef<HTMLCanvasElement[]>([]);
  const addCheckerTileCanvasesRef = useCallback((elem: HTMLCanvasElement) => {
    checkerTileCanvasesRef.current.push(elem);
  }, []);

  const drawCheckerTile = (
    canvas: HTMLCanvasElement,
    tileSize: number,
    lightness: number,
  ) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const parent = canvas.parentElement;
    if (!parent) return;
    const { width, height } = parent.getBoundingClientRect();
    if (!width || !height) return;

    const devicePixelRatio = window.devicePixelRatio || 1;

    console.log("devicePixelRatio", devicePixelRatio);

    canvas.width = width;
    canvas.height = height;

    const checkerTile = (x: number, y: number) => {
      ctx.fillRect(x, y, tileSize * lightness, tileSize * lightness);
      ctx.fillRect(
        x - tileSize * lightness,
        y - tileSize * lightness,
        tileSize * lightness,
        tileSize * lightness,
      );
    };

    ctx.fillStyle = "rgb(0, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const rowMax = Math.ceil(canvas.height / tileSize);
    const columnMax = Math.ceil(canvas.width / tileSize);
    ctx.fillStyle = "rgb(255, 255, 255)";
    for (let row = -1; row < rowMax + 1; row++) {
      const y = row * tileSize;
      for (let column = -1; column < columnMax + 1; column++) {
        const x = column * tileSize;
        checkerTile(x, y);
      }
    }

    return ctx;
  };

  useEffect(() => {
    const canvases = checkerTileCanvasesRef.current;
    canvases.forEach((aCanvas) => {
      drawCheckerTile(
        aCanvas,
        Number(aCanvas.dataset.tileSize),
        Number(aCanvas.dataset.lightness),
      );
    });
  });

  return (
    <>
      <p>cheker</p>
      <div className={cx("palette")}>
        <div className={cx("swatch")}>
          <canvas
            ref={addCheckerTileCanvasesRef}
            data-tile-size={2}
            data-lightness={0.0}
          ></canvas>
        </div>
        <div className={cx("swatch")} style={{ position: "relative" }}>
          <canvas
            ref={addCheckerTileCanvasesRef}
            data-tile-size={2}
            data-lightness={0.5}
          ></canvas>
          <div
            style={{
              backgroundColor: "red",
              position: "absolute",
              top: "0px",
              bottom: "0px",
              left: "50%",
              right: "0px",
            }}
          ></div>
        </div>
        <div className={cx("swatch")}>
          <canvas
            ref={addCheckerTileCanvasesRef}
            data-tile-size={2}
            data-lightness={1.0}
          ></canvas>
        </div>
      </div>
      <p>cheker-blurred</p>
      <div className={cx("palette")}>
        <div className={cx("swatch")}>
          <canvas
            ref={addCheckerTileCanvasesRef}
            data-tile-size={2}
            data-lightness={0.0}
            style={{ filter: "blur(4px)" }}
          ></canvas>
        </div>
        <div className={cx("swatch")}>
          <canvas
            ref={addCheckerTileCanvasesRef}
            data-tile-size={2}
            data-lightness={0.5}
            style={{ filter: "blur(4px)" }}
          ></canvas>
        </div>
        <div className={cx("swatch")}>
          <canvas
            ref={addCheckerTileCanvasesRef}
            data-tile-size={2}
            data-lightness={1.0}
            style={{ filter: "blur(4px)" }}
          ></canvas>
        </div>
      </div>
      <p>srgb-linear</p>
      <div className={cx("palette")}>{createSwatches("srgb-linear", 3)}</div>
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

export default GreyExperiments;
