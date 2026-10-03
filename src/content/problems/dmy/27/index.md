---
oj: dmy
pid: '27'
title: '[R5C] 众数'
difficulty: 入门
tags:
  - 计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 10^6$，$1 \le A_i \le 10^7$。

## 思路

用数组 $cnta[x]$ 统计数字 $x$ 在 $A$ 中的出现次数，那么 $B[i] = cnta[A[i]]$。

再用数组 $cntb[y]$ 统计 $B$ 中每个值 $y$ 的出现次数，$y$ 的范围是 $1 \sim n$（出现次数不可能超过 $n$）。$B$ 的众数就是使 $cntb[y]$ 最大的 $y$；扫描时用 `>=` 更新答案，即可在平局时取到最大的 $y$。

复杂度：时间 $O(n + V)$（$V = \max A_i$），空间 $O(V)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let cnta = Array<Int64>(10000001, { _ => 0 })
    for (v in a) {
        cnta[v] = cnta[v] + 1
    }
    let cntb = Array<Int64>(n + 1, { _ => 0 })
    for (v in a) {
        cntb[cnta[v]] = cntb[cnta[v]] + 1
    }
    var best: Int64 = 0
    var ans: Int64 = 0
    for (x in 1..(n + 1)) {
        if (cntb[x] >= best) {
            best = cntb[x]
            ans = x
        }
    }
    println(ans)
}
```

</details>
