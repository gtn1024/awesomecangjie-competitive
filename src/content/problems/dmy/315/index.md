---
oj: dmy
pid: '315'
title: '[R51A] Forcecodes'
difficulty: 入门
tags:
  - 模拟
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le x, a_i \le 4039$。

## 思路

按题意直接模拟即可。设当前 rating 为 $r$，初始 $r = x$。对每场比赛的表现分 $a_i$，依次执行更新

$$
r \leftarrow \left\lfloor \frac{r + a_i}{2} \right\rfloor
$$

打完 $n$ 场后的 $r$ 即为答案。

由于 $r$ 与 $a_i$ 始终非负，整数除法 `/` 对应的就是向下取整，无需额外处理。

复杂度：时间 $O(n)$，空间 $O(n)$（用于存 $a$ 数组）。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    var x = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    for (i in 0..n) {
        x = (x + a[i]) / 2
    }
    println("${x}")
}
```

要点：

- 第一行的 $n$ 与 $x$ 一次性读入，第二行的 $a$ 数组按行 `.map` 读入，行尾多余空格由 `split(" ", removeEmpty: true)` 过滤。
- $r$ 与 $a_i$ 始终非负，`/` 即为向下取整，无需对奇偶做特判。
