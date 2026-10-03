---
oj: dmy
pid: '178'
title: '[R29E] 矩形求和'
difficulty: 普及+/提高
tags:
  - 位运算
  - 计数
timeLimit: 3s
memoryLimit: 512m
---

> 数据规模：$n \le 40$，$Q \le 5 \times 10^5$，$0 \le A_{i,j}, v < 998244353$，查询的行列范围 $0 \le r_1 \le r_2, c_1 \le c_2 < 2^n$。

## 思路

把 $i, j$ 写成二进制后，矩阵元素是逐位贡献的和：

$$M_{i,j} = \sum_{k=0}^{n-1} A_{k,\,2\cdot i_k + j_k}$$

于是矩形 $[r_1, r_2] \times [c_1, c_2]$ 的和可以交换求和顺序：对每个二进制位 $k$，统计矩形内「行第 $k$ 位为 $b_1$、列第 $k$ 位为 $b_2$」的格子数，正好等于 $R_k(b_1) \cdot C_k(b_2)$（行与列的选择互不影响），其中 $R_k(b)$ 是区间 $[r_1, r_2]$ 内第 $k$ 位等于 $b$ 的整数个数，$C_k(b)$ 同理。所以：

$$\text{ans} = \sum_{k=0}^{n-1} \sum_{b_1, b_2 \in \{0,1\}} A_{k,\,2b_1+b_2} \cdot R_k(b_1) \cdot C_k(b_2)$$

**统计第 $k$ 位为 $1$ 的个数**：$[0, X]$ 内第 $k$ 位为 $1$ 的数有

$$\mathrm{cnt}(X, k) = \left\lfloor \frac{X+1}{2^{k+1}} \right\rfloor \cdot 2^k + \max\!\left(0, (X+1) \bmod 2^{k+1} - 2^k\right)$$

即每 $2^{k+1}$ 个一循环，其中后 $2^k$ 个的第 $k$ 位为 $1$。记 $cr_1 = \mathrm{cnt}(r_2,k) - \mathrm{cnt}(r_1-1,k)$，$cr_0 = (r_2 - r_1 + 1) - cr_1$，$cc_1, cc_0$ 同理，则 $R_k(1) = cr_1$，$R_k(0) = cr_0$，列同理。

**展开化简**：把 $cr_0 = \text{len}R - cr_1$、$cc_0 = \text{len}C - cc_1$ 代入原式并整理：

$$\text{ans} = \text{len}R \cdot \text{len}C \cdot \sum_k A_{k,0} + \text{len}R \sum_k (A_{k,1} - A_{k,0}) cc_1 + \text{len}C \sum_k (A_{k,2} - A_{k,0}) cr_1 + \sum_k (A_{k,0} - A_{k,1} - A_{k,2} + A_{k,3}) \cdot cr_1 cc_1$$

这样每个查询只需对每个 $k$ 计算 4 个边界值 $r_2, r_1-1, c_2, c_1-1$ 的 $\mathrm{cnt}$（$O(1)$），再套用维护好的系数即可。修改操作只改变某一层的 $A$，更新该层的三个系数 $w_1, w_2, w_3$ 与总和 $s_0 = \sum_k A_{k,0}$ 即可，$O(1)$。

所有计数不超过 $2^{40}$，用 `Int64` 精确存放；乘法前先取模 $998244353$，中间乘积不超过 $10^{18}$，不会溢出。

## 复杂度

时间 $O(n)$ 预处理 + $O(n)$ 每次操作，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow().trimAscii())

    let a = Array<Array<Int64>>(n, { _ => Array<Int64>(4, { _ => 0 }) })
    for (k in 0..n) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        a[k][0] = Int64.parse(line[0])
        a[k][1] = Int64.parse(line[1])
        a[k][2] = Int64.parse(line[2])
        a[k][3] = Int64.parse(line[3])
    }

    let q = Int64.parse(reader.readln().getOrThrow().trimAscii())

    let pow2 = Array<Int64>(n + 1, { _ => 1 })
    for (k in 1..(n + 1)) {
        pow2[k] = pow2[k - 1] * 2
    }

    let w1 = Array<Int64>(n, { _ => 0 })
    let w2 = Array<Int64>(n, { _ => 0 })
    let w3 = Array<Int64>(n, { _ => 0 })
    var s0: Int64 = 0
    for (k in 0..n) {
        let a0 = a[k][0]
        let a1 = a[k][1]
        let a2 = a[k][2]
        let a3 = a[k][3]
        s0 = (s0 + a0) % 998244353
        w1[k] = (a1 - a0 + 998244353) % 998244353
        w2[k] = (a2 - a0 + 998244353) % 998244353
        w3[k] = ((a0 - a1 - a2 + a3) % 998244353 + 998244353) % 998244353
    }

    for (_ in 0..q) {
        let line = reader.readln().getOrThrow().split(" ", removeEmpty: true)
        if (line[0] == "1") {
            let k = Int64.parse(line[1])
            let c = Int64.parse(line[2])
            let v = Int64.parse(line[3])
            let old0 = a[k][0]
            a[k][c] = v
            let a0 = a[k][0]
            let a1 = a[k][1]
            let a2 = a[k][2]
            let a3 = a[k][3]
            s0 = (s0 + a0 - old0 % 998244353 + 998244353) % 998244353
            w1[k] = (a1 - a0 + 998244353) % 998244353
            w2[k] = (a2 - a0 + 998244353) % 998244353
            w3[k] = ((a0 - a1 - a2 + a3) % 998244353 + 998244353) % 998244353
        } else {
            let r1 = Int64.parse(line[1])
            let c1 = Int64.parse(line[2])
            let r2 = Int64.parse(line[3])
            let c2 = Int64.parse(line[4])
            let lenR = r2 - r1 + 1
            let lenC = c2 - c1 + 1
            let lenRm = lenR % 998244353
            let lenCm = lenC % 998244353
            let tR2 = r2 + 1
            let tR1 = r1
            let tC2 = c2 + 1
            let tC1 = c1
            var acc2: Int64 = 0
            var acc3: Int64 = 0
            var acc4: Int64 = 0
            for (k in 0..n) {
                let p2 = pow2[k]
                let sh = k + 1
                var s = tR2 >> sh
                var rem = tR2 - (s << sh)
                var cnt = s * p2
                if (rem > p2) {
                    cnt += rem - p2
                }
                var cr1 = cnt
                s = tR1 >> sh
                rem = tR1 - (s << sh)
                cnt = s * p2
                if (rem > p2) {
                    cnt += rem - p2
                }
                cr1 -= cnt
                s = tC2 >> sh
                rem = tC2 - (s << sh)
                cnt = s * p2
                if (rem > p2) {
                    cnt += rem - p2
                }
                var cc1 = cnt
                s = tC1 >> sh
                rem = tC1 - (s << sh)
                cnt = s * p2
                if (rem > p2) {
                    cnt += rem - p2
                }
                cc1 -= cnt
                let cr1m = cr1 % 998244353
                let cc1m = cc1 % 998244353
                acc2 = (acc2 + w1[k] * cc1m) % 998244353
                acc3 = (acc3 + w2[k] * cr1m) % 998244353
                acc4 = (acc4 + w3[k] * ((cr1m * cc1m) % 998244353)) % 998244353
            }
            let ans = (((lenRm * lenCm) % 998244353) * s0 + lenRm * acc2 + lenCm * acc3 + acc4) % 998244353
            println(ans)
        }
    }
}
```

</details>
