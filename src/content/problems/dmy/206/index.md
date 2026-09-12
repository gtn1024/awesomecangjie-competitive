---
oj: dmy
pid: '206'
title: '[R34C]无限序列'
difficulty: 提高
tags:
  - 数学
  - 进制
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le T \le 10^4$，$1 \le n \le 10^9$，$2 \le m \le 10$。

## 思路

序列 $g(m)$ 由每个正整数 $k$ 的 $m$ 进制串 $S$ 与其反转 $S_{rev}$ 拼接得到，即每项贡献 $S + S_{rev}$，共 $2|S|$ 位。把 $k$ 按其 $m$ 进制位数 $d$ 分段处理，可在 $O(\log_m n)$ 时间内定位到第 $n$ 位。

**按位数分段。** $d$ 位数的 $k$ 取值范围为 $[m^{d-1},\, m^d - 1]$，共有 $\text{cnt}_d = m^d - m^{d-1}$ 个。每个 $k$ 贡献 $2d$ 位，所以整个 $d$ 位段的总位数为

$$
\text{seg}_d = (m^d - m^{d-1}) \cdot 2d.
$$

从 $d=1$ 起依次累减，把 $n$ 减去各段总位数，直到 $n \le \text{seg}_d$，即定位到所在的位数 $d$。

**段内定位。** 在 $d$ 位段内每个 $k$ 占 $2d$ 位。设 $\text{width} = 2d$，则

- 该 $k$ 在段内排第 $t = \lfloor (n-1)/\text{width} \rfloor$（$0$ 开始），对应的正整数为 $k = m^{d-1} + t$；
- 在 $S + S_{rev}$ 中处于第 $\text{offset} = (n-1) \bmod \text{width}$ 位（$0$ 开始）。

记 $S$ 的 $d$ 位（高位在前）为 $S[0..d-1]$，则 $S_{rev}[i] = S[d-1-i]$。因此第 $\text{offset}$ 位为：

$$
\begin{cases}
S[\text{offset}], & \text{offset} < d \\
S_{rev}[\text{offset} - d] = S[2d - 1 - \text{offset}], & \text{offset} \ge d
\end{cases}
$$

**求 $k$ 的 $m$ 进制表示。** 反复对 $m$ 取余、整除得到低位在前的各位，填入长度为 $d$ 的数组（高位在前）即可。

**防溢出。** $n \le 10^9$，$m=2$ 时 $2^{30} > 10^9$，故 $d \le 30$。累减和幂运算全程使用 `Int64`，足够安全。

## 复杂度

每次询问时间 $O(\log_m n)$，即位数 $d$ 的量级（$m=2$ 时至多约 $30$）。空间 $O(d)$。$T \le 10^4$ 时总耗时远低于限制。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

func solve(reader: ConsoleReader): Unit {
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var n = line[0]
    let m = line[1]
    // 找到 n 落在第几位的段：d 位数段
    var d: Int64 = 1
    var mpow: Int64 = 1 // m^{d-1}
    while (true) {
        let md = mpow * m // m^d
        let count = md - mpow // d 位数的个数
        let seg = count * 2 * d // 这一段总位数
        if (n <= seg) {
            break
        }
        n -= seg
        mpow = md
        d++
    }
    let dd = d
    let width = 2 * dd
    let t = (n - 1) / width // 段内第 t 个 d 位数（0-indexed）
    let offset = (n - 1) % width // 在 S+S_rev 中的 0-indexed 位置
    let k = mpow + t
    // k 在 m 进制下的 d 位表示（高位在前）
    let digits = Array<Int64>(dd, { _ => 0 })
    var i = dd - 1
    var kk = k
    while (i >= 0) {
        digits[i] = kk % m
        kk /= m
        i--
    }
    var idx: Int64
    if (offset < dd) {
        idx = offset
    } else {
        idx = 2 * dd - 1 - offset
    }
    println(digits[idx])
}

main() {
    let reader = Console.stdIn
    let tt = Int64.parse(reader.readln().getOrThrow())
    var i: Int64 = 0
    while (i < tt) {
        solve(reader)
        i++
    }
}
```
