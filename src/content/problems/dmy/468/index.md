---
oj: dmy
pid: '468'
title: '[R75F] 旋律编排'
difficulty: 提高+
tags:
  - 动态规划
  - 计数
timeLimit: 2s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 3000$，$p$ 是 $1,2,\dots,n$ 的排列。

## 思路

**先说明为什么可以数「放置方案」。** 处理完 $p_n$ 后，$p_1,\dots,p_n$ 恰好占满整个数组，而 $p_n$ 一定是最终排列的某一端。删掉它以后，$p_1,\dots,p_{n-1}$ 仍是连续的一段，$p_{n-1}$ 一定是这段的某一端……如此倒着推，每一步都唯一确定。也就是说，给定最终排列 $b$，放置过程是唯一还原出来的（$n \ge 3$ 时每段至少三个元素，两端不可能相同；$n=2$ 时 $p_2$ 也只可能待在一端）。于是「不同的最终排列」与「合法的放置方案」一一对应，直接数方案即可。

**把转折条件写成只与位置奇偶有关的形式。** 记 $b$ 中相邻位置 $x$ 与 $x+1$ 的高低关系 $d_x = \operatorname{sgn}(b_{x+1}-b_x)$。走势不断转折就是 $d_x$ 随 $x$ 交替，即存在固定符号 $D \in \{\pm 1\}$ 使得

$$d_x = (-1)^{x-1} D .$$

$n \le 2$ 时没有任何内部位置，任何最终排列都合法，与上式不冲突。

处理 $p_1,\dots,p_i$ 时它们占据连续的一段 $[l_i,r_i]$，其中 $p_i$ 必在这段的一端。把 $p_{i+1}$ 接到端元素 $e$ 的外侧时，新产生的相邻关系就是 $p_{i+1}$ 与 $e$ 的关系。无论接在左端（新位置 $l_i-1$，相邻关系落在位置 $l_i-1$）还是右端（新位置 $r_i+1$，相邻关系落在位置 $r_i$），要求都化为同一个式子

$$\operatorname{sgn}(p_{i+1}-e) = -D \cdot (-1)^{\operatorname{pos}(e)} ,$$

其中 $\operatorname{pos}(e)$ 是 $e$ 在 $b$ 中的位置。

再把常数项消掉。记 $\varphi(e) = (-1)^{\operatorname{pos}(e)-\operatorname{pos}(p_1)}$，并令 $t = \operatorname{sgn}(p_2-p_1)$。$p_2$ 一定是接在 $p_1$ 外侧的，这一步把 $-D \cdot (-1)^{\operatorname{pos}(p_1)}$ 定成了 $t$，于是条件变成

$$\operatorname{sgn}(p_{i+1}-e) = t \cdot \varphi(e).$$

也就是说，判断一步是否合法，只需要知道 $t$ 和被接的那个端元素相对 $p_1$ 的位置奇偶 $\varphi$。

**状态设计。** 处理完 $p_i$ 以后，这一段 $[l_i,r_i]$ 的两端分别是 $p_i$ 与某个先放入的 $p_j$（$j<i$）。设 $f[j][s][\varphi]$ 表示方案数，其中 $s$ 表示 $p_i$ 在左端（$s=0$）还是右端（$s=1$），$\varphi = \varphi(p_i)$。两端距离恰为 $i-1$，故 $\varphi(p_j) = \varphi(p_i)(-1)^{i-1}$，记录 $p_i$ 的 $\varphi$ 就够了。

把 $p_{i+1}$ 接上去时有两个选择：

- 接在 $p_i$ 所在的一端：要求 $\operatorname{sgn}(p_{i+1}-p_i) = t\varphi$，新状态 $(j,\ s,\ -\varphi)$；
- 接在 $p_j$ 所在的一端：要求 $\operatorname{sgn}(p_{i+1}-p_j) = t\varphi(-1)^{i-1}$，新状态 $\big(i,\ 1-s,\ -\varphi(-1)^{i-1}\big)$。

**初始与答案。** $p_2$ 接在 $p_1$ 左侧或右侧都还没有任何约束，所以 $i=2$ 时初始状态为 $(j=1,s=0)$ 与 $(j=1,s=1)$ 各 $1$ 种，且 $\varphi(p_2) = (-1)^{\pm 1} = -1$。逐层推到 $i=n$ 后，把 $j < n$ 的全部状态求和即为答案；$n=1$ 与 $n=2$ 时答案分别是 $1$ 与 $2$。

## 复杂度

时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    if (n == 1) {
        println(1)
        return 0
    }
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
    // t = sign(p_2 - p_1)
    let t: Int64 = if (p[1] > p[0]) { 1 } else { -1 }
    // 状态 (j, s, b)：p_i 位于 s 端（0 左 / 1 右），另一端是 p_j，
    // b = 0 表示 phi_i = +1，b = 1 表示 phi_i = -1
    let size = (n + 1) * 4
    var f = Array<Int64>(size, { _ => 0 })
    var g = Array<Int64>(size, { _ => 0 })
    // i = 2 的初始状态：p_2 放在 p_1 左侧或右侧，phi_2 = -1
    f[1 * 4 + 1] = 1
    f[1 * 4 + 2 + 1] = 1
    var i: Int64 = 2
    while (i < n) {
        let lim = (i + 1) * 4
        var k: Int64 = 0
        while (k < lim) {
            g[k] = 0
            k += 1
        }
        let z = (i - 1) & 1
        let px = p[i]      // p_{i+1}
        let pi = p[i - 1]  // p_i
        var j: Int64 = 1
        while (j < i) {
            let pj = p[j - 1]
            let base = j * 4
            var s: Int64 = 0
            while (s < 2) {
                var b: Int64 = 0
                while (b < 2) {
                    let v = f[base + s * 2 + b]
                    if (v != 0) {
                        // 接在 p_i 所在的一端
                        let w1 = if (b == 1) { -t } else { t }
                        let r1 = if (px > pi) { 1 } else { -1 }
                        if (w1 == r1) {
                            let idx = base + s * 2 + (1 - b)
                            let nv = g[idx] + v
                            g[idx] = if (nv >= MOD) { nv - MOD } else { nv }
                        }
                        // 接在 p_j 所在的一端
                        let bb = b ^ z
                        let w2 = if (bb == 1) { -t } else { t }
                        let r2 = if (px > pj) { 1 } else { -1 }
                        if (w2 == r2) {
                            let idx = i * 4 + (1 - s) * 2 + (bb ^ 1)
                            let nv = g[idx] + v
                            g[idx] = if (nv >= MOD) { nv - MOD } else { nv }
                        }
                    }
                    b += 1
                }
                s += 1
            }
            j += 1
        }
        let tmp = f
        f = g
        g = tmp
        i += 1
    }
    var ans: Int64 = 0
    var j: Int64 = 1
    while (j < n) {
        let base = j * 4
        var k: Int64 = 0
        while (k < 4) {
            ans += f[base + k]
            if (ans >= MOD) {
                ans -= MOD
            }
            k += 1
        }
        j += 1
    }
    println(ans)
    return 0
}
```

</details>
