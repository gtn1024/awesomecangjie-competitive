---
oj: dmy
pid: '437'
title: '[R70E] 裁决'
difficulty: 普及/提高-
tags:
  - 数学
  - 字符串
timeLimit: 2s
memoryLimit: 512m
---

## 数据规模

$n \le 2000$，需要计算全部 $n^2$ 个 $W(i, j)$。暴力枚举 $i, j$ 后逐轮求和是 $O(n^3)$，不可行；$O(n^2)$ 或 $O(n^2 \log n)$ 可行。

## 思路

**只与差值有关**。记 $d = (j - i) \bmod n$，则第 $k$ 轮第一名玩家选择 $s[(i+k) \bmod n]$，第二名玩家选择 $s[(j+k) \bmod n] = s[(i+k+d) \bmod n]$。令 $t = (i+k) \bmod n$，这一轮相当于：第一名出 $s[t]$，第二名出 $s[(t+d) \bmod n]$，获胜时得分 $k = (t - i) \bmod n$。

于是对固定的 $d$，定义胜者集合

$$
P_d = \left\{ t \in [0, n) \;\middle|\; s[t] \text{ 战胜 } s[(t + d) \bmod n] \right\}
$$

则

$$
W(i, j) = \sum_{t \in P_d} ((t - i) \bmod n)
$$

**展开公式**。$(t - i) \bmod n$ 在 $t \ge i$ 时为 $t - i$，在 $t < i$ 时为 $t - i + n$，因此

$$
W(i, j) = \sum_{t \in P_d} t - i \cdot |P_d| + n \cdot \left|\{t \in P_d : t < i\}\right|
$$

**增量计算**。对每个 $d \in [0, n)$ 先算出 $m_d = |P_d|$ 与 $\mathrm{sum}_d = \sum_{t \in P_d} t$。然后按 $i = 0, 1, \dots, n-1$ 扫描：维护 $\mathrm{cnt}_d = |\{t \in P_d : t < i\}|$，每处理完一行 $i$，检查 $t = i$ 是否属于 $P_d$，若是则对所有 $d$ 的 $\mathrm{cnt}_d$ 加 1。每个 $d$ 的贡献是 $O(1)$，答案 $W(i, (i+d) \bmod n)$ 直接写入第 $i$ 行第 $(i+d) \bmod n$ 列。

复杂度：$O(n^2)$ 时间，$O(n)$ 空间（输出本身是 $n^2$ 个数）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

func beats(x: UInt8, y: UInt8): Bool {
    return (x == 'A'[0] && y == 'B'[0]) || (x == 'B'[0] && y == 'C'[0]) || (x == 'C'[0] && y == 'A'[0])
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let nn = n
    let mCnt = Array<Int64>(nn, { _ => 0 })
    let sumAll = Array<Int64>(nn, { _ => 0 })
    var d: Int64 = 0
    while (d < nn) {
        var m: Int64 = 0
        var sm: Int64 = 0
        var t: Int64 = 0
        while (t < nn) {
            let td = (t + d) % nn
            if (beats(s[t], s[td])) {
                m = m + 1
                sm = sm + t
            }
            t = t + 1
        }
        mCnt[d] = m
        sumAll[d] = sm
        d = d + 1
    }
    let cntLt = Array<Int64>(nn, { _ => 0 })
    var i: Int64 = 0
    while (i < nn) {
        var j: Int64 = 0
        while (j < nn) {
            let dd = (j - i + nn) % nn
            let w = sumAll[dd] - i * mCnt[dd] + nn * cntLt[dd]
            if (j > 0) {
                print(" ")
            }
            print(w)
            j = j + 1
        }
        println()
        var d3: Int64 = 0
        while (d3 < nn) {
            let td = (i + d3) % nn
            if (beats(s[i], s[td])) {
                cntLt[d3] = cntLt[d3] + 1
            }
            d3 = d3 + 1
        }
        i = i + 1
    }
}
```
