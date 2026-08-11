---
oj: dmy
pid: '137'
title: '[R23B]翻转数位'
difficulty: 普及−
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^4$，$0 \le k \le 10^9$，$a_i \in \{0, 1\}$。

## 思路

统计数组中 $1$ 的个数 $c$。要把数组全变成 $0$，最直接的做法是挑出每个 $1$ 各翻转一次，恰好用掉 $c$ 次操作。题目要求操作**恰好** $k$ 次，因此剩下 $k - c$ 次必须消耗在「无效翻转」上：对任意一个位置翻转两次后会回到原状，所以多余的次数只能成对地消耗。

于是充要条件为：$k \ge c$ 且 $k - c$ 为偶数。满足则输出 `Yes`，否则输出 `No`。

## 复杂度

时间 $O(n)$（每组数据遍历一次数组），空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let t = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..t) {
        let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        let k = parts[1]
        let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        var c = 0
        for (x in a) {
            if (x == 1) {
                c += 1
            }
        }
        if (k >= Int64(c) && ((k - Int64(c)) % 2 == 0)) {
            println("Yes")
        } else {
            println("No")
        }
    }
    return 0
}
```
