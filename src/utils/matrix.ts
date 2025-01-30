export const inverseMatrix = (matrix: number[][]) => {
  const n = matrix.length;

  // NxN 검증
  if (!matrix.every((row) => row.length === n)) {
    throw new Error("입력 행렬은 NxN 형태여야 합니다.");
  }

  // 2x2 행렬은 빠른 공식을 사용
  if (n === 2) {
    const [[a, b], [c, d]] = matrix;
    const det = a * d - b * c;
    if (det === 0) throw new Error("역행렬이 존재하지 않습니다.");
    return [
      [d / det, -b / det],
      [-c / det, a / det],
    ];
  }

  // 3x3 이상은 가우스-조던 소거법을 사용
  return gaussJordanInverse(matrix);
};

const gaussJordanInverse = (matrix: number[][]) => {
  const n = matrix.length;
  const augmented: number[][] = matrix.map((row, i) => [
    ...row,
    ...Array(n)
      .fill(0)
      .map((_, j) => (i === j ? 1 : 0)),
  ]);

  for (let i = 0; i < n; i++) {
    // 절댓값이 가장 큰 행을 찾아 피벗으로 설정 (수치 안정성 개선)
    let maxRow = i;
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(augmented[k][i]) > Math.abs(augmented[maxRow][i])) {
        maxRow = k;
      }
    }
    if (augmented[maxRow][i] === 0)
      throw new Error("역행렬이 존재하지 않습니다.");

    // 행 교환 (pivoting)
    [augmented[i], augmented[maxRow]] = [augmented[maxRow], augmented[i]];

    // 피벗을 1로 변환
    const pivot = augmented[i][i];
    augmented[i] = augmented[i].map((x) => x / pivot);

    // 다른 행에서 피벗 열 제거
    for (let j = 0; j < n; j++) {
      if (j !== i) {
        const factor = augmented[j][i];
        augmented[j] = augmented[j].map(
          (x, idx) => x - factor * augmented[i][idx],
        );
      }
    }
  }

  // 결과 행렬 추출 (오른쪽 부분이 역행렬)
  return augmented.map((row) => row.slice(n));
};
