---
oj: dmy
pid: '296'
title: '[R48A]四舍五入'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le n \le 10^9$。

## 思路

设 $g = n \bmod 10$ 为 $n$ 的个位数字。

- 若 $g \le 4$，直接将个位变为 $0$，即 $n - g$；
- 若 $g \ge 5$，向十位进一并将个位变为 $0$，即 $n - g + 10$。

两种情况可统一为一个表达式。注意到给 $n$ 加上 $5$ 后再整除 $10$ 取整，恰好实现「个位四舍五入到十位」的效果：

$$\text{ans} = \left\lfloor \frac{n + 5}{10} \right\rfloor \times 10$$

验证边界：

- $n = 14$：$(14 + 5) / 10 \times 10 = 1 \times 10 = 10$，正确；
- $n = 15$：$(15 + 5) / 10 \times 10 = 2 \times 10 = 20$，正确。

由于 $n \le 10^9$，$n + 5$ 不会溢出 `Int64`，可直接用整数运算一步求得答案。

## 复杂度

- 时间复杂度：$O(1)$。
- 空间复杂度：$O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    println(((n + 5) / 10) * 10)
}
```

</details>
