---
oj: dmy
pid: '391'
title: '[R63A] 宝物'
difficulty: 入门
tags:
  - 数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 100$，$1 \le l_i \le 1000$。

## 思路

$n$ 条边能组成凸 $n$ 边形当且仅当每条边都小于周长的一半。最长的边最难满足，因此只需判断最长边是否小于周长一半，即 $2 \times \max l_i < \sum l_i$。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let l = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var sum: Int64 = 0
    var mx: Int64 = 0
    for (x in l) {
        sum = sum + x
        if (x > mx) {
            mx = x
        }
    }
    println(if (mx * 2 < sum) { "Yes" } else { "No" })
    return 0
}
```

要点：

- 把「每条边小于周长一半」转化为「最长边小于周长一半」，扫一遍同时求出总和与最大值。
- 用整数比较 $2 \times mx < sum$ 替代除法，避免浮点误差。
