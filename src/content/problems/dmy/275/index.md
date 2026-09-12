---
oj: dmy
pid: '275'
title: '[R45A]沙威玛传奇'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 对于 $100\%$ 的数据，$1 \le p_4 \le p_2,p_3 \le p_1 \le 10^9$，数据保证答案存在且为非负整数。

## 思路

这是经典的 **容斥原理** 问题。

记：

- 买第一种沙威玛的顾客集合为 $A$，$|A| = p_2$；
- 买第二种沙威玛的顾客集合为 $B$，$|B| = p_3$；
- 两种都买的顾客数 $|A \cap B| = p_4$。

至少买一种的顾客数为 $|A \cup B| = |A| + |B| - |A \cap B| = p_2 + p_3 - p_4$。

总顾客数为 $p_1$，所以什么也没买的顾客数为：

$$p_1 - (p_2 + p_3 - p_4) = p_1 - p_2 - p_3 + p_4$$

数据范围到 $10^9$，用 `Int64` 存储即可，题目保证答案非负。

## 复杂度

- 时间复杂度：$O(1)$。
- 空间复杂度：$O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let v = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let p1 = v[0]
    let p2 = v[1]
    let p3 = v[2]
    let p4 = v[3]
    println(p1 - p2 - p3 + p4)
}
```
