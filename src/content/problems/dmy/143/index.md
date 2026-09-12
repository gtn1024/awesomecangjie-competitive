---
oj: dmy
pid: '143'
title: '[R24B]买糖果'
difficulty: 普及+
tags:
  - 数学
  - 枚举
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 < a < 10^6$，$10^6 \le b \le 10^9$，$1 \le x \le 10^9$。

## 思路

三种钱币的面额为 $1$、$a$、$b$。设使用 $i$ 枚 $1$ 元、$j$ 枚 $a$ 元、$k$ 枚 $b$ 元，则凑钱条件为 $i + j \cdot a + k \cdot b = x$。一旦 $j, k$ 确定，$i = x - j \cdot a - k \cdot b$ 就被唯一确定（且 $i \ge 0$ 等价于 $j \cdot a + k \cdot b \le x$）。所以方案数等于满足 $j \cdot a + k \cdot b \le x$ 的非负整数对 $(j, k)$ 的个数。

直接枚举 $j$ 或 $k$ 都可以，但复杂度取决于谁更小。注意到 $a < 10^6$ 而 $b \ge 10^6$，于是：

$$0 \le k \le \left\lfloor \frac{x}{b} \right\rfloor \le \frac{10^9}{10^6} = 1000$$

$k$ 的取值很少，因此枚举 $k$。对每个固定的 $k$，剩余金额 $\text{rem} = x - k \cdot b$，能用的 $a$ 元张数 $j$ 的范围是 $0 \le j \le \left\lfloor \text{rem} / a \right\rfloor$，共 $\left\lfloor \text{rem} / a \right\rfloor + 1$ 种。累加即可。

注意 $x$ 可达 $10^9$、$j$ 可达 $10^3$ 数量级，累加结果用 `Int64` 完全够，不会溢出。

## 复杂度

时间 $O(x/b) \le 1000$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let a = line[0]
    let b = line[1]
    let x = line[2]

    // j*a + k*b <= x，枚举 k，统计满足条件的 j >= 0 的个数
    var ans: Int64 = 0
    var k: Int64 = 0
    while (k * b <= x) {
        let rem = x - k * b
        ans += rem / a + 1
        k += 1
    }
    println(ans)
    return 0
}
```
