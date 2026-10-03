---
oj: dmy
pid: '374'
title: '[R60B] 均摊'
difficulty: 入门
tags:
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, x, a_i \le 100$。

## 思路

条件 $\frac{a_1 + \dots + a_y}{y} \ge x$ 等价于前缀和 $s_y \ge x \times y$。枚举 $y = 1 \sim n$，边累加前缀和边判断：第一个满足的 $y$ 是答案的最小值，每遇到一个满足的 $y$ 都更新答案的最大值。题目保证至少存在一个满足条件的 $y$。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nx = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let n = nx[0]
    let x = nx[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var sum: Int64 = 0
    var mn: Int64 = -1
    var mx: Int64 = -1
    for (y in 1..(n + 1)) {
        sum = sum + a[y - 1]
        if (sum >= x * y) {
            if (mn < 0) {
                mn = y
            }
            mx = y
        }
    }
    println("${mn} ${mx}")
}
```

</details>

要点：

- 判断条件写成 $s_y \ge xy$ 可避免浮点除法。
- 最小值只在第一次满足时记录（用 `mn < 0` 判断是否已记录），最大值每次满足都更新。
