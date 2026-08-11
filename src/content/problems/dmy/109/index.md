---
oj: dmy
pid: '109'
title: '[R19A]特殊卡片'
difficulty: 普及/普及+
tags:
  - 模拟
  - 排列
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 1000$，保证 $a$ 是 $1$ 到 $n$ 的排列（每个数字恰好出现一次）。

## 思路

第 $i$ 张卡片是特殊卡片，当且仅当存在某个 $j$ 满足 $a_i = j$ 且 $a_j = i$。

由于输入保证是 $1$ 到 $n$ 的一个排列（即数组下标集合 $\{1,\dots,n\}$ 到数值集合 $\{1,\dots,n\}$ 的双射），$a_i = j$ 中的 $j$ 被 $a_i$ 唯一确定：$j = a_i$。于是「存在 $j$」这个条件不用枚举，直接看 $j = a_i$ 是否满足 $a_j = i$ 即可。

也就是说，第 $i$ 张卡片特殊当且仅当

$$a_{a_i} = i.$$

逐位判断即可。注意题目中卡片下标从 $1$ 开始，代码里数组下标从 $0$ 开始，要做相应偏移。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var cnt = 0
    var i = Int64(0)
    while (i < n) {
        // 第 (i+1) 张卡片上的数字是 a[i]；条件 a_{a_{i+1}} == i+1
        if (a[a[i] - 1] == i + 1) {
            cnt++
        }
        i++
    }
    println(cnt)
    return 0
}
```
