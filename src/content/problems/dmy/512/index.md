---
oj: dmy
pid: '512'
title: '[R80A] 染色'
difficulty: 入门
tags:
  - 数学
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

## 数据规模

$1 \le a, b \le n \le 100$。答案不超过 $n$，用 64 位整数足够。

## 思路

左侧机器涂的是区间 $[1, a]$，右侧机器涂的是区间 $[n-b+1, n]$。两段区间的交集长度为

$$
t = \max(0, a+b-n),
$$

即当 $a+b \le n$ 时两段不重叠，$t = 0$；否则重合 $a+b-n$ 个方格。

把两台机器涂色的次数相加，得到 $a+b$。其中恰好被一台机器涂色的方格被计了 $1$ 次，被两台机器同时涂色的方格被计了 $2$ 次。设恰好只被一台机器涂色的方格有 $x$ 个，则

$$
x + 2t = a+b,
$$

所以

$$
x = a+b - 2\max(0, a+b-n).
$$

等价的写法是 $n - \lvert a+b-n \rvert$：全部 $n$ 个方格减去两台机器都涂的 $a+b-n$ 个，以及一台机器都没涂的 $n-(a+b)$ 个。

## 复杂度

时间复杂度 $O(1)$，空间复杂度 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = v[0]
    let a = v[1]
    let b = v[2]
    var t: Int64 = a + b - n
    if (t < 0) {
        t = 0
    }
    println(a + b - 2 * t)
}
```
