---
oj: dmy
pid: '7'
title: '[R2A] 三人组队'
difficulty: 入门
tags:
  - 贪心
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 100$，$1 \le a_i \le 10^5$。

## 思路

队伍总能力值是三人能力值之和，最大和一定来自能力值最大的三个人，只需在扫描过程中维护最大的三个值 $mx1 \ge mx2 \ge mx3$：遇到新数 $a$ 时依次与三个值比较插入，最后输出 $mx1+mx2+mx3$。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var mx1: Int64 = 0
    var mx2: Int64 = 0
    var mx3: Int64 = 0
    for (i in 0..n) {
        if (a[i] > mx1) {
            mx3 = mx2
            mx2 = mx1
            mx1 = a[i]
        } else if (a[i] > mx2) {
            mx3 = mx2
            mx2 = a[i]
        } else if (a[i] > mx3) {
            mx3 = a[i]
        }
    }
    println(mx1 + mx2 + mx3)
    return 0
}
```

要点：

- 三个最大值的初值设为 $0$，而 $a_i \ge 1$，前三个数会被正确插入。
- 数组按题面在第二行一次性读入，行尾多余空格由 `split(" ", removeEmpty: true)` 过滤。
