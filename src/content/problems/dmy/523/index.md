---
oj: dmy
pid: '523'
title: '[R82A] 邮票'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le W, P, S \le 100$，且 $P > S$。

## 思路

设贴 $k$ 张邮票。邮件总重量是信封自身的重量加上所有邮票的重量，即 $W + kS$；邮票能支付的重量是 $kP$。两者都关于 $k$ 线性增长，而每贴一张，支付能力比自身重量多出 $P - S$ 克（由 $P > S$ 保证这一增益为正），所以贴得越多越容易满足条件。

条件为

$$
kP \ge W + kS \iff k(P - S) \ge W \iff k \ge \frac{W}{P - S}.
$$

因此最少张数就是 $\left\lceil \dfrac{W}{P-S} \right\rceil$。用整数运算写成 `(W + d - 1) / d`，其中 $d = P - S$，避免浮点误差。

样例 $1$：$d = 6 - 2 = 4$，$\lceil 10/4 \rceil = 3$。样例 $2$：$d = 5 - 1 = 4$，$\lceil 2/4 \rceil = 1$。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let a = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let w = a[0]
    let p = a[1]
    let s = a[2]
    let d = p - s
    println((w + d - 1) / d)
}
```

</details>
