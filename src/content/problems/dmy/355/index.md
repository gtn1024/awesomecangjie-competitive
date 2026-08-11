---
oj: dmy
pid: '355'
title: '[R57B] BearName'
difficulty: 入门
tags:
  - 模拟
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, m \le 2 \times 10^5$，$0 \le x \le m$。

## 思路

用变量 `x` 记录熊大当前所在的跑道，按顺序模拟每一个操作：

- `L`：尝试向左移动一格，若 `x > 0` 则 `x -= 1`，否则留在第 $0$ 条跑道；
- `R`：尝试向右移动一格，若 `x < m` 则 `x += 1`，否则留在第 $m$ 条跑道。

操作结束后输出 `x` 即可。题目保证输入合法，不需要额外处理。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let m = a[1]
    var x = a[2]
    let s = reader.readln().getOrThrow()
    for (ch in s.toRuneArray()) {
        if (ch == r'L') {
            if (x > 0) {
                x -= 1
            }
        } else if (x < m) {
            x += 1
        }
    }
    println(x)
    return 0
}
```
