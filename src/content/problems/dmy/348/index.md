---
oj: dmy
pid: '348'
title: '[R56A] 可乐'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 100$，$1 \le x \le 10^9$。

## 思路

买 $3$ 送 $1$：每付 $3$ 瓶的钱，最多能得到 $4$ 瓶，等价于每 $4$ 瓶里有 $1$ 瓶免费。

设付费 $p$ 瓶，则得到的总瓶数为 $p + \lfloor p/3 \rfloor$。要使总瓶数至少 $n$，取

$$p = n - \left\lfloor \frac{n}{4} \right\rfloor$$

按 $n \bmod 4$ 分类验证：

- $n = 4k$：$p = 3k$，得 $4k = n$ 瓶；
- $n = 4k+1$：$p = 3k+1$，得 $4k+1 = n$ 瓶；
- $n = 4k+2$：$p = 3k+2$，得 $4k+2 = n$ 瓶；
- $n = 4k+3$：$p = 3k+3$，得 $4k+4 \ge n$ 瓶。

若付费瓶数减 $1$，则每类情形得到的总瓶数都少于 $n$（分别少 $2, 1, 1, 1$ 瓶），因此 $n - \lfloor n/4 \rfloor$ 就是最少的付费瓶数，答案为 $(n - \lfloor n/4 \rfloor) \times x$。

注意 $x \le 10^9$、$n \le 100$，答案最大约 $10^{11}$，需用 64 位整数计算。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = a[0]
    let x = a[1]
    println((n - n / 4) * x)
}
```

要点：

- `n / 4` 为整数除法，即 $\lfloor n/4 \rfloor$；直接乘以 `x` 即为最少花费。
