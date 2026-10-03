---
oj: dmy
pid: '427'
title: '[R69A] 包装'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, x \le 1000$。

## 思路

一次「装 $x$ 瓶」的操作等价于 $x$ 次「装 1 瓶」，但只花 1 次操作，所以第一种方式用得越多越好。最多能用 $\lfloor n/x \rfloor$ 次第一种方式，剩下的 $n \bmod x$ 瓶用第二种方式逐瓶装，总操作数为

$$\left\lfloor \frac{n}{x} \right\rfloor + n \bmod x$$

$x > n$ 时 $\lfloor n/x \rfloor = 0$，退化为全部单瓶包装，公式同样成立。

复杂度：时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nx = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nx[0]
    let x = nx[1]
    println(n / x + n % x)
}
```

</details>

要点：

- 贪心正确性：设第一种方式用了 $k$ 次，总操作数为 $k + (n - kx) = n - k(x-1)$，随 $k$ 单调递减，故 $k$ 取最大值 $\lfloor n/x \rfloor$。
