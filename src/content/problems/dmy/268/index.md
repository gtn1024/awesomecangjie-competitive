---
oj: dmy
pid: '268'
title: '[R43F]听取蛙声一片2'
difficulty: 提高+
tags:
  - 动态规划
  - 组合数学
  - 计数
timeLimit: 3s
memoryLimit: 1024m
---

> 数据规模：$n, m, k \le 5000$，$10^8 \le P \le 10^9$，$P$ 不一定是质数。

## 思路

记二元组 $(S, T)$ 中，$S$ 为初始状态串（AC/WA），$T$ 为被强制改 WA 的下标集合。称位置 $i$ 被**覆盖**，当且仅当 $S_i$ 为 WA 或 $i \in T$（即最终状态中该位置是 WA）。于是「最终存在连续 $m$ 个 WA」等价于「覆盖串 $C$ 中存在连续 $m$ 个 1」。

先看覆盖串与二元组的对应关系。固定一个覆盖串 $C$：每个覆盖位置（$C_i = 1$）对应三种选择 $(S_i, T_i)$：$(\text{WA}, 0)$、$(\text{WA}, 1)$、$(\text{AC}, 1)$；每个未覆盖位置对应唯一选择 $(\text{AC}, 0)$。因此若 $C$ 有 $c$ 个 1，则对应 $|T| \le k$ 的二元组数为

$$g(c) = \sum_{t=0}^{\min(k, c)} \binom{c}{t} 2^t$$

于是答案为「总二元组数」减去「覆盖串不含连续 $m$ 个 1 的二元组数」：

$$\text{ans} = 2^n \sum_{t=0}^{k} \binom{n}{t} - \sum_{C \text{ 无连续 } m \text{ 个 1}} g(\text{cnt}_1(C))$$

**计算 $\sum_C g(\text{cnt}_1(C))$**：对覆盖串按游程结构 DP。设 $Z(d, o)$ 为以 0 游程结尾、含 $d$ 个 0、$o$ 个 1 的合法串数，$O(d, o)$ 为以 1 游程结尾的同类串数。1 游程长度限制在 $[1, m-1]$ 内，且 0/1 游程必须交替：

$$Z(d, o) = \sum_{d' < d} O(d', o) + [o = 0, d \ge 1]$$

$$O(d, o) = \sum_{o' = \max(1, o-m+1)}^{o-1} Z(d, o') + [d = 0, 1 \le o \le m-1]$$

实现时把 $d$ 作为外层循环：维护 $\text{accO}(o) = \sum_{d' < d} O(d', o)$，则 $Z(d, o) = \text{accO}(o) + [o = 0, d \ge 1]$；$O(d, \cdot)$ 用滑动窗口在 $o$ 方向 $O(1)$ 均摊求出。每步 $d$ 把对角线 $o = n - d$ 上的 $Z + O$ 乘以 $g(o)$ 累加进答案即可。$\binom{c}{t}$ 用滚动帕斯卡行预处理 $g(c)$（$O(n^2)$），全程只需加法与乘法，**不要求 $P$ 是质数**。

## 复杂度

时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let m = line[1]
    let k = line[2]
    let P = line[3]

    // pow2[i] = 2^i mod P
    var pow2 = Array<Int64>(n + 1, { _ => 0 })
    pow2[0] = 1 % P
    for (i in 1..=n) {
        pow2[i] = (pow2[i - 1] * 2) % P
    }

    // g[c] = sum_{t=0}^{min(k,c)} C(c,t) * 2^t (mod P)，用滚动帕斯卡行计算
    var row = Array<Int64>(n + 1, { _ => 0 })
    var g = Array<Int64>(n + 1, { _ => 0 })
    row[0] = 1 % P
    g[0] = 1 % P
    var c: Int64 = 1
    while (c <= n) {
        var t = c
        while (t >= 1) {
            row[t] = (row[t] + row[t - 1]) % P
            t = t - 1
        }
        var lim = k
        if (lim > c) {
            lim = c
        }
        var s: Int64 = 0
        var j: Int64 = 0
        while (j <= lim) {
            s = (s + row[j] * pow2[j]) % P
            j = j + 1
        }
        g[c] = s
        c = c + 1
    }

    // total = 2^n * sum_{t<=k} C(n,t) mod P
    var sRow: Int64 = 0
    var j: Int64 = 0
    while (j <= k) {
        sRow = (sRow + row[j]) % P
        j = j + 1
    }
    let total = pow2[n] * sRow % P

    // 按 0/1 游程结构 DP（1 表示被覆盖），统计不存在连续 m 个 1 的覆盖串数量（模 P）
    // accO[o] = 已处理完的、以 1 游程结尾、含 o 个 1 的串数
    var accO = Array<Int64>(n + 1, { _ => 0 })
    var Ocur = Array<Int64>(n + 1, { _ => 0 })
    var bad: Int64 = 0
    var d: Int64 = 0
    while (d <= n) {
        var W: Int64 = 0
        var o: Int64 = 1
        while (o <= n - d) {
            var zPrev = accO[o - 1]
            if (o - 1 == 0 && d >= 1) {
                zPrev = (zPrev + 1) % P
            }
            W = (W + zPrev) % P
            if (o - m >= 0) {
                var zOut = accO[o - m]
                if (o - m == 0 && d >= 1) {
                    zOut = (zOut + 1) % P
                }
                W = (W - zOut) % P
                if (W < 0) {
                    W = W + P
                }
            }
            var Od = W
            if (d == 0 && o <= m - 1) {
                Od = (Od + 1) % P
            }
            Ocur[o] = Od
            if (o == n - d) {
                var Zd = accO[o]
                if (o == 0 && d >= 1) {
                    Zd = (Zd + 1) % P
                }
                let cnt = (Zd + Od) % P
                bad = (bad + cnt * g[o]) % P
            }
            o = o + 1
        }
        if (d == n) {
            // 全 0 串
            bad = (bad + g[0]) % P
        }
        var oo: Int64 = 1
        while (oo <= n - d) {
            accO[oo] = (accO[oo] + Ocur[oo]) % P
            oo = oo + 1
        }
        d = d + 1
    }

    var ans = (total - bad) % P
    if (ans < 0) {
        ans = ans + P
    }
    println(ans)
}

```
