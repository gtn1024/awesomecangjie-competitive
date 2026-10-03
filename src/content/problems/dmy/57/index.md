---
oj: dmy
pid: '57'
title: '[R10C] 多重回字'
difficulty: 普及-
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 1999$，$n$ 为奇数。

## 思路

格子 $(x, y)$ 所在的层数为它到四条边距离的最小值 $d = \min(x, y, n-1-x, n-1-y)$，第 $d$ 层（从外到内，$0$ 开始）是 `#` 当且仅当 $d$ 为偶数。逐行逐列判断后输出即可。

复杂度：时间 $O(n^2)$，空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    for (x in 0..n) {
        for (y in 0..n) {
            var d = x
            if (y < d) {
                d = y
            }
            if (n - 1 - x < d) {
                d = n - 1 - x
            }
            if (n - 1 - y < d) {
                d = n - 1 - y
            }
            if (d % 2 == 0) {
                print("#")
            } else {
                print(" ")
            }
        }
        println()
    }
}
```

</details>
