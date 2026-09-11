---
oj: dmy
pid: '173'
title: '[R28F]矩形异或'
difficulty: 提高
tags:
  - 线性代数
  - 高斯消元
  - 异或
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \times m \le 3000$，$k \le 1000$，$0 \le A_{i,j} < 2^{30}$。

## 思路

每个格子 $(x, y)$ 最终要变成 $0$，也就是**覆盖它的那些矩形的 $v_i$ 的异或和**必须等于 $A_{x,y}$。于是问题变成一个 $\mathrm{GF}(2)$ 上的线性方程组：

- 未知数：$v_1, v_2, \dots, v_k$；
- 方程：每个格子一条，共 $n \times m$ 条，系数为 0/1（该矩形是否覆盖此格）；
- 常数项：$A_{x,y}$。

$A_{i,j} < 2^{30}$，即每个数是 30 位。虽然位数不同，但**所有位的系数矩阵完全相同**，因此可以直接把整数的 30 位当作一个整体参与消元（异或运算逐位独立，主元结构一致），消元结束时对每个主元变量赋值即可。

用**高斯-约当消元**求解。因为 $k \le 1000$，把每行的系数压缩成位集：一行用 $\lceil k/64 \rceil$ 个 `UInt64` 表示。对每一列：

1. 在当前行及以下找第一个该位为 1 的行作为主元行，交换到当前行；
2. 把该列从**所有其他行**消去（整行异或，右侧常数项同步异或）。

消元结束后，非主元行（自由变量对应的行）系数全为 0，它们必须满足右侧常数项为 0，否则无解，输出 `No`。有解时，主元列对应的变量取该主元行的右侧值，自由变量取 0，即为所求 $v_i$。

## 复杂度

时间 $O((n \times m) \times k^2 / 64)$，空间 $O((n \times m) \times k / 64)$。$n \times m \le 3000$、$k \le 1000$ 时完全可行。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let m = first[1]
    let k = first[2]
    let R = n * m
    let W = (k + 63) / 64

    // rows[cell] 为覆盖该格子的矩形位集，rhs[cell] 为矩阵初值 A[cell]
    let rows = Array<Array<UInt64>>(R, { _ => Array<UInt64>(W, { _ => 0 }) })
    let rhs = Array<Int64>(R, { _ => 0 })
    for (i in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        for (j in 0..m) {
            rhs[i * m + j] = line[j]
        }
    }
    for (i in 0..k) {
        let q = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let x1 = q[0] - 1
        let y1 = q[1] - 1
        let x2 = q[2] - 1
        let y2 = q[3] - 1
        let bit = UInt64(1) << UInt64(i % 64)
        let w = i / 64
        var x = x1
        while (x <= x2) {
            var y = y1
            while (y <= y2) {
                rows[x * m + y][w] = rows[x * m + y][w] | bit
                y += 1
            }
            x += 1
        }
    }

    // 高斯-约当消元：每列找一个主元行，并消去所有其他行
    let pivotRow = Array<Int64>(k, { _ => -1 })
    var cur = 0
    for (c in 0..k) {
        let w = c / 64
        let bit = UInt64(1) << UInt64(c % 64)
        var piv = -1
        var r = cur
        while (r < R) {
            if ((rows[r][w] & bit) != 0) {
                piv = r
                break
            }
            r += 1
        }
        if (piv == -1) {
            continue
        }
        let tmpRow = rows[cur]
        rows[cur] = rows[piv]
        rows[piv] = tmpRow
        let tmpRhs = rhs[cur]
        rhs[cur] = rhs[piv]
        rhs[piv] = tmpRhs
        var rr = 0
        while (rr < R) {
            if (rr != cur && (rows[rr][w] & bit) != 0) {
                var ww = 0
                while (ww < W) {
                    rows[rr][ww] = rows[rr][ww] ^ rows[cur][ww]
                    ww += 1
                }
                rhs[rr] = rhs[rr] ^ rhs[cur]
            }
            rr += 1
        }
        pivotRow[c] = cur
        cur += 1
    }

    // 非主元行的系数全为 0（自由变量取 0），其右侧必须为 0
    var r = cur
    while (r < R) {
        if (rhs[r] != 0) {
            println("No")
            return 0
        }
        r += 1
    }

    let sol = Array<Int64>(k, { _ => 0 })
    for (c in 0..k) {
        let pr = pivotRow[c]
        if (pr >= 0) {
            sol[c] = rhs[pr]
        }
    }
    println("Yes")
    for (i in 0..k) {
        if (i > 0) {
            print(" ")
        }
        print(sol[i])
    }
    println()
    return 0
}
```
