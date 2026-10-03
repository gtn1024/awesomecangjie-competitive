---
oj: dmy
pid: '29'
title: '[R5E] 余数和'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

## 思路

$$N \bmod i = N - i \times \left\lfloor \frac{N}{i} \right\rfloor$$

所以 $\sum_{i=1}^{N}(N \bmod i) = N^2 - \sum_{i=1}^{N} i \times \left\lfloor \frac{N}{i} \right\rfloor$。

$\left\lfloor \frac{N}{i} \right\rfloor$ 只有 $O(\sqrt N)$ 种取值，按相同的商分块：对块 $[l, r]$（$r = \left\lfloor \frac{N}{\lfloor N/l \rfloor} \right\rfloor$），商为 $q$，贡献为 $q \times \frac{(l+r)(r-l+1)}{2}$。

复杂度：时间 $O(\sqrt N)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var total: Int64 = 0
    var l: Int64 = 1
    while (l <= n) {
        let q = n / l
        let r = n / q
        total += q * (l + r) * (r - l + 1) / 2
        l = r + 1
    }
    println(n * n - total)
}
```

</details>
