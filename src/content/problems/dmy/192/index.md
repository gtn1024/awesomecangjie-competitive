---
oj: dmy
pid: '192'
title: '[R32A]染色游戏'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le l_1 \le r_1 \le 100$，$1 \le l_2 \le r_2 \le 100$。

## 思路

两次染色得到的是两个区间 $[l_1, r_1]$ 和 $[l_2, r_2]$，被染黑的格子总数即这两个区间的并集大小。由容斥原理：

$$|[l_1, r_1] \cup [l_2, r_2]| = (r_1 - l_1 + 1) + (r_2 - l_2 + 1) - |[l_1, r_1] \cap [l_2, r_2]|$$

两个区间的交集为 $[\max(l_1, l_2),\ \min(r_1, r_2)]$。若 $\min(r_1, r_2) \ge \max(l_1, l_2)$，重叠长度为 $\min(r_1, r_2) - \max(l_1, l_2) + 1$；否则两区间不相交，重叠长度为 $0$。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.console.*
import std.convert.*

main() {
    let reader = Console.stdIn
    let parts = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let (l1, r1, l2, r2) = (parts[0], parts[1], parts[2], parts[3])
    let len1 = r1 - l1 + 1
    let len2 = r2 - l2 + 1
    let hi = if (r1 < r2) { r1 } else { r2 }
    let lo = if (l1 > l2) { l1 } else { l2 }
    var overlap = hi - lo + 1
    if (overlap < 0) {
        overlap = 0
    }
    let ans = len1 + len2 - overlap
    println(ans)
}
```
