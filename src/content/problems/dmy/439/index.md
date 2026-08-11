---
oj: dmy
pid: '439'
title: '[R71A] 跬步千里'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 21$。

## 思路

日程以 $4$ 天为一个周期循环：

- 第 $1$ 天：专题训练（`Topic Training`）；
- 第 $2$ 天：模拟赛（`Contest`）；
- 第 $3$ 天：专题训练（`Topic Training`）；
- 第 $4$ 天：总结会（`Summary Meeting`）。

因此第 $n$ 天的日程只取决于 $n \bmod 4$：余 $1$ 或 $3$ 时是 `Topic Training`，余 $2$ 时是 `Contest`，余 $0$ 时是 `Summary Meeting`。按余数直接输出即可。

## 复杂度

时间 $O(1)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    var ans = "Topic Training"
    if (n % 4 == 2) {
        ans = "Contest"
    } else if (n % 4 == 0) {
        ans = "Summary Meeting"
    }
    println(ans)
}
```
