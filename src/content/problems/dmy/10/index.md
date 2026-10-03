---
oj: dmy
pid: '10'
title: '[R2D] 倍数问题'
difficulty: 普及/提高-
tags:
  - 数论
  - 数学
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n,q \le 10^6$，$1 \le a_i,x_i \le 5 \times 10^5$。

## 思路

记 $num[v]$ 为 $a$ 中值为 $v$ 的项数，则询问 $x$ 的答案是 $\sum_{j \text{ 是 } x \text{ 的倍数}} num[j]$。

对每个 $x$ 暴力枚举倍数会超时，改为类似 **埃氏筛** 的预处理：对每个 $i$，累加 $num[i], num[2i], num[3i], \dots$ 得到 $ans[i]$。总枚举量约为 $A(1+\frac12+\frac13+\dots) = O(A \log A)$，$A = 5 \times 10^5$ 时约 $6 \times 10^6$ 次加法。

之后每个询问 $O(1)$ 回答。

复杂度：时间 $O(n + A \log A + q)$，空间 $O(A)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const MAXV = 500000

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    var num = Array<Int64>(MAXV + 1, { _ => 0 })
    for (i in 0..n) {
        num[a[i]] += 1
    }
    var ans = Array<Int64>(MAXV + 1, { _ => 0 })
    for (i in 1..=MAXV) {
        var s: Int64 = 0
        var j = i
        while (j <= MAXV) {
            s += num[j]
            j += i
        }
        ans[i] = s
    }
    let q = Int64.parse(reader.readln().getOrThrow())
    for (_ in 0..q) {
        let x = Int64.parse(reader.readln().getOrThrow())
        println(ans[x])
    }
}
```

</details>

要点：

- 值域只有 $5 \times 10^5$，直接开数组计数，不需要排序或哈希。
- 询问有 $10^6$ 个，每个答案直接用 `println` 输出。
