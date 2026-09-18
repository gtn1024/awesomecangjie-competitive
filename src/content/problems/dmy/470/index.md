---
oj: dmy
pid: '470'
title: '[R76B] 还是串移位'
difficulty: 入门
tags:
  - 模拟
  - 枚举
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le k \le n \le 100$，$0 \le x \le k$，$S$ 仅由 `#` 与 `.` 组成。

## 思路

圆环上共有 $n$ 个起点，每个起点对应一段 $k$ 个连续格子。直接枚举全部 $n$ 个起点，对每个起点统计窗口内 `#` 的个数，再与 $x$ 比较即可。

因为是圆环，起点 $i$ 取到的第 $j$ 个格子（$j$ 从 $0$ 开始计数）在原串中的下标是 $(i+j) \bmod n$。

样例中 $n=6$、$k=3$、$x=2$，三个起点分别取到 `#.#`、`.##`、`##.`，各含 $2$ 个黑格，其余起点只含 $1$ 个，故答案为 $3$。

## 复杂度

时间 $O(nk)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let nums = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = nums[0]
    let k = nums[1]
    let x = nums[2]
    let s = reader.readln().getOrThrow().toRuneArray()

    var ans = 0
    var i = 0
    while (i < n) {
        var cnt = 0
        var j = 0
        while (j < k) {
            if (s[(i + j) % n] == r'#') {
                cnt += 1
            }
            j += 1
        }
        if (cnt == x) {
            ans += 1
        }
        i += 1
    }
    println(ans)
}
```
