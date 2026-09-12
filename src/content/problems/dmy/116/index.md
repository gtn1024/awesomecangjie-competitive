---
oj: dmy
pid: '116'
title: '[R20B]最佳搭档'
difficulty: 普及+
tags:
  - 数学
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 1000$，$1 \le a_i \le 10^9$。

## 思路

关键观察是搭档成立的条件：$a_i + a_j$ 为偶数。两个数之和为偶数，当且仅当它们**奇偶性相同**——同为偶数或同为奇数。

因此整个数列天然分成两个互不干扰的集合：偶数集合与奇数集合。搭档只能在同一集合内两两配对，跨集合的任意一对都凑不出偶数和。要使配对数最多，就在每个集合内尽可能多地配对：设偶数个数为 $\text{even}$、奇数个数为 $\text{odd}$，则答案为：

$$\left\lfloor \frac{\text{even}}{2} \right\rfloor + \left\lfloor \frac{\text{odd}}{2} \right\rfloor$$

遍历一遍数组按 $a_i \bmod 2$ 分类计数即可。

## 复杂度

时间 $O(n)$，空间 $O(n)$（读入数组所需）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var odd = 0
    var even = 0
    for (x in a) {
        if (x % 2 == 0) {
            even++
        } else {
            odd++
        }
    }
    println("${odd / 2 + even / 2}")
}
```
