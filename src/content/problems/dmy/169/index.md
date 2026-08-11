---
oj: dmy
pid: '169'
title: '[R28B]晚宴'
difficulty: 入门
tags:
  - 暴力
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 1000$，$1 \le A_i, B_i \le 10^9$。

## 思路

餐桌顺时针旋转 $k$ 个单位时，原来在位置 $j$ 的菜移动到位置 $(j+k) \bmod n$。等价地说，旋转后位置 $i$ 上的菜来自初始位置 $(i-k) \bmod n$。美食家 $i$ 被满足的条件就是 $B_{(i-k) \bmod n} = A_i$。

旋转量 $k$ 只有 $n$ 种取值（$0 \le k \le n-1$），数据规模 $n \le 1000$，所以直接**枚举每一种旋转量 $k$**，再 $O(n)$ 统计该旋转下被满足的美食家数量，取所有 $k$ 中的最大值即为答案。

## 复杂度

时间 $O(n^2)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let nn = n
    var ans: Int64 = 0
    for (k in 0..nn) {
        var cnt: Int64 = 0
        for (i in 0..nn) {
            var j = (i - k) % nn
            if (j < 0) {
                j = j + nn
            }
            if (b[j] == a[i]) {
                cnt = cnt + 1
            }
        }
        if (cnt > ans) {
            ans = cnt
        }
    }
    println(ans.toString())
    return 0
}
```
