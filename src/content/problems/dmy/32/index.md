---
oj: dmy
pid: '32'
title: '[R6B] MEX'
difficulty: 入门
tags:
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^5$，$0 \le A_i \le 10^9$，$A_i$ 互不相等。

## 思路

$0 \sim n$ 共 $n + 1$ 个数，而集合只有 $n$ 个元素，所以 $\text{MEX}$ 一定不超过 $n$。

标记所有满足 $A_i \le n$ 的元素，然后从 $0$ 开始找第一个未被标记的数即可。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let seen = Array<Bool>(n + 1, { _ => false })
    for (v in a) {
        if (v <= n) {
            seen[v] = true
        }
    }
    for (x in 0..(n + 1)) {
        if (!seen[x]) {
            println(x)
            return
        }
    }
}
```
