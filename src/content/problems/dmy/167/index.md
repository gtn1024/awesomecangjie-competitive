---
oj: dmy
pid: '167'
title: '[R27G] 山峰'
difficulty: 提高
tags:
  - DP
  - 计数
  - 前缀和
timeLimit: 3s
memoryLimit: 512m
---

> 数据规模：$n \le 300$（$n$ 为奇数），$H \le 700$，$X_i \le 500$。

## 思路

$n$ 为奇数，设 $m = (n-1)/2$。偶数位置是「山峰」，奇数位置是「山谷」。记山谷为 $v_1, \ldots, v_{m+1}$（$v_j = h_{2j-1}$），山峰为 $p_1, \ldots, p_m$（$p_j = h_{2j}$），则约束变为：

$$p_j \ge v_j + v_{j+1},\qquad p_j \le X_{2j}$$

令 $p_j = v_j + v_{j+1} + q_j$，其中 $0 \le q_j \le X_{2j} - v_j - v_{j+1}$（不满足时方案数为 $0$）。

做 DP：状态 $(a, s)$ 表示当前山谷值 $a = v_j$、累计和 $s$（截断到 $H$，下标 $H$ 表示和 $\ge H$）。转移时枚举下一个山谷 $b = v_{j+1}$ 和增量 $q$：

$$(a, s) \to \left(b,\ \min\left(H,\ s + a + 2b + q\right)\right),\qquad 0 \le q \le T - a - b$$

其中 $T = X_{2j}$ 是当前山峰的上界。

直接做是 $O(m \cdot X^2 \cdot H)$，需要优化转移。记 $f_a(s)$ 为当前状态数、$F_a(s) = \sum_{t \le s} f_a(t)$ 为其前缀和。固定 $b$ 与目标和 $t$，能转移到 $t$ 的条件是 $s + a + 2b \le t \le s + b + T$，即 $s \in [t - b - T,\ t - a - 2b]$。因此：

$$\text{newdp}_b[t] = \sum_{a \le T-b} \bigl(F_a(t - a - 2b) - F_a(t - b - T - 1)\bigr)$$

第一项是「对角线前缀和」$\sum_{a \le y} F_a(d - a)$（$d = t - 2b$，$y = T - b$），第二项是 $\sum_{a \le y} F_a(s_0)$（$s_0 = t - b - T - 1$），两者都可以对每个 $d$/$s_0$ 沿 $a$ 做一次前缀和得到，从而每个状态 $O(1)$ 求出。下标 $t = H$ 的值用「总方案数减去 $t < H$ 的部分」补齐：

$$\text{newdp}_b[H] = \sum_{a \le T-b} (T - a - b + 1) \cdot \text{rowsum}(a) - \sum_{t < H} \text{newdp}_b[t]$$

初始状态 $v_1 = a$：$\text{dp}[a][\min(a, H)] = 1$。处理完全部 $m$ 个山峰后，答案为 $\sum_b \text{dp}[b][H]$。中间值不超过 $10^{18}$，可直接用 `Int64` 累计，仅在对结果取模处做模运算。

## 复杂度

时间 $O(m \cdot X \cdot H) \approx 1.5 \times 10^8$，空间 $O(X \cdot H)$，其中 $X = 500$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

// P167 [R27G] 山峰
// n 为奇数。偶数位置（山峰）满足 h[i] >= h[i-1] + h[i+1]。
// 记山谷 v_1..v_{m+1}（奇数位置）、山峰 p_1..p_m（偶数位置，m=(n-1)/2），
// 约束 p_j >= v_j + v_{j+1}，且 p_j <= X[2j]。
// DP：状态 (当前山谷值 a, 累计和 s 截断到 H)。
// 转移：选下一个山谷 b 与山峰增量 q（p_j = a + b + q, 0 <= q <= T-a-b），
//   (a, s) -> (b, min(H, s + a + 2b + q))
// 用前缀和技巧把每步转移优化到 O(A*H)。

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true)
    let n = Int64.parse(first[0])
    let H = Int64.parse(first[1])
    let X = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let m = (n - 1) / 2
    let cols = H + 1

    // 山谷位置是 0-based 偶数下标，取其最大值作为数组行数上界
    var Amax: Int64 = 0
    var ii: Int64 = 0
    while (ii < n) {
        if (X[ii] > Amax) {
            Amax = X[ii]
        }
        ii += 2
    }
    let A1 = Amax + 1
    let dpLen = A1 * cols

    var dp = Array<Int64>(dpLen, { _ => 0 })
    var newdp = Array<Int64>(dpLen, { _ => 0 })
    var F = Array<Int64>(dpLen, { _ => 0 })
    let E = Array<Int64>((H + 1) * A1, { _ => 0 })
    let R = Array<Int64>((H + 1) * A1, { _ => 0 })
    var rowsum = Array<Int64>(A1, { _ => 0 })
    var M1 = Array<Int64>(A1, { _ => 0 })
    var R2 = Array<Int64>(A1, { _ => 0 })

    // 初始化：v_1 = a，和为 a（截断到 H）
    var a0: Int64 = 0
    while (a0 <= X[0]) {
        let s0 = if (a0 < H) { a0 } else { H }
        dp[a0 * cols + s0] = 1
        a0 += 1
    }

    var jj: Int64 = 0
    while (jj < m) {
        let T = X[2 * jj + 1]
        let B = X[2 * jj + 2]
        let Acap = X[2 * jj]   // 当前山谷值上界（行 a 的范围）

        // F[a][s] = dp[a][0..s] 前缀和；rowsum[a] = F[a][H]
        var ra: Int64 = 0
        while (ra <= Acap) {
            let base = ra * cols
            var acc: Int64 = 0
            var s: Int64 = 0
            while (s < cols) {
                acc += dp[base + s]
                F[base + s] = acc
                s += 1
            }
            rowsum[ra] = acc
            ra += 1
        }

        // E[d][y] = sum_{a<=y} F_a(d-a)，d in [0, H]，y in [0, Acap]
        var d: Int64 = 0
        while (d <= H) {
            let ebase = d * A1
            var acc2: Int64 = 0
            var ra2: Int64 = 0
            while (ra2 <= Acap) {
                let x = d - ra2
                if (x >= 0) {
                    acc2 += F[ra2 * cols + x]
                }
                E[ebase + ra2] = acc2
                ra2 += 1
            }
            d += 1
        }

        // R[s0][y] = sum_{a<=y} F_a(s0)，s0 in [0, H]
        var s0: Int64 = 0
        while (s0 <= H) {
            let rbase = s0 * A1
            var acc3: Int64 = 0
            var ra3: Int64 = 0
            while (ra3 <= Acap) {
                acc3 += F[ra3 * cols + s0]
                R[rbase + ra3] = acc3
                ra3 += 1
            }
            s0 += 1
        }

        // M1[y] = sum_{a<=y} (T-a+1)*rowsum[a]；R2[y] = sum_{a<=y} rowsum[a]
        var accM: Int64 = 0
        var accR: Int64 = 0
        var ra4: Int64 = 0
        while (ra4 <= Acap) {
            accM += (T - ra4 + 1) * rowsum[ra4]
            accR += rowsum[ra4]
            M1[ra4] = accM
            R2[ra4] = accR
            ra4 += 1
        }

        // 填 newdp
        var b: Int64 = 0
        while (b <= B) {
            let y = T - b
            if (y >= 0) {
                var yc = y
                if (yc > Acap) {
                    yc = Acap
                }
                let totalMass = M1[yc] - b * R2[yc]
                var rowTot: Int64 = 0
                let nbase = b * cols
                if (2 * b < H) {
                    var t: Int64 = 2 * b
                    while (t < H) {
                        let dd = t - 2 * b
                        var v1: Int64 = 0
                        if (dd >= 0) {
                            v1 = E[dd * A1 + yc]
                        }
                        let ss0 = t - b - T - 1
                        var v2: Int64 = 0
                        if (ss0 >= 0) {
                            v2 = R[ss0 * A1 + yc]
                        }
                        let val = v1 - v2
                        newdp[nbase + t] = val % MOD
                        rowTot += val
                        t += 1
                    }
                }
                var vH = totalMass - rowTot
                vH = vH % MOD
                if (vH < 0) {
                    vH += MOD
                }
                newdp[nbase + H] = vH
            }
            b += 1
        }

        let tmp = dp
        dp = newdp
        newdp = tmp
        var k: Int64 = 0
        while (k < dpLen) {
            newdp[k] = 0
            k += 1
        }
        jj += 1
    }

    var ans: Int64 = 0
    var bb: Int64 = 0
    while (bb < A1) {
        ans += dp[bb * cols + H]
        bb += 1
    }
    ans = ans % MOD
    println(ans)
}
```
