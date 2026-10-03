---
oj: dmy
pid: '363'
title: '[R58D] 双胞胎周长'
difficulty: 普及+/提高
tags:
  - 数学
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le a_i \le 10^9$，所有 $a_i$ 模 $3$ 同余。

## 思路

设 $s(p)$ 为周长为 $p$ 的整数边长三角形个数：三边无序，$1 \le x \le y \le z$，$x + y + z = p$，$x + y > z$。

**无序三元组计数**：先数允许退化的三元组，即 $p$ 拆成恰好三个正整数的无序拆分，方案数为

$$P(p)=\left\lfloor\frac{p^2+3}{12}\right\rfloor$$

**退化计数**：退化（$x + y \le z$）等价于 $x + y \le p/2$；此时 $x + 2y \le 2(x+y) \le p$，故 $y \le z$ 自动满足，无需额外约束。于是退化三元组与二元组「$1 \le x \le y$，$x + y \le m$」一一对应，其中 $m = \lfloor p/2 \rfloor$：固定 $x$ 时 $y$ 可取 $x \sim m - x$ 共 $m - 2x + 1$ 个，求和得

$$D(p)=\begin{cases}k^2, & m = 2k\\ k(k+1), & m = 2k+1\end{cases}$$

因此 $s(p) = P(p) - D(p)$ 可 $O(1)$ 算出，$p^2 \le 10^{18}$ 在 `Int64` 范围内；该公式对任意周长成立，与「全部元素模 $3$ 同余」的约定无关。

**统计答案**：把每个 $s_i$ 都算出来，$s_i$ 相同的下标两两成对。将 $s$ 值排序后扫描连续相等段，段长为 $c$ 时贡献 $c(c-1)/2$。

复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

// 周长为 p 的整数边长三角形个数：
// 把 p 拆成三个正整数（无序）的方案数 P = floor((p^2+3)/12)，
// 其中退化的（x+y <= z）有 D 个：m = floor(p/2)，m=2k 时 D=k^2，m=2k+1 时 D=k(k+1)。
func triangles(p: Int64): Int64 {
    let P = (p * p + 3) / 12
    let m = p / 2
    let k = m / 2
    let d = if (m % 2 == 0) { k * k } else { k * (k + 1) }
    return P - d
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var ss = Array<Int64>(a.size, { _ => 0 })
    for (i in 0..a.size) {
        ss[i] = triangles(a[i])
    }
    sort(ss)
    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < ss.size) {
        var j = i
        while (j < ss.size && ss[j] == ss[i]) {
            j++
        }
        let c = j - i
        ans += c * (c - 1) / 2
        i = j
    }
    println(ans)
}
```

</details>
