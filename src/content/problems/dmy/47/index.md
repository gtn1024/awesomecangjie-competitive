---
oj: dmy
pid: '47'
title: '[R8E] 区间MEX'
difficulty: 提高
tags:
  - MEX
  - 前缀最值
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^6$，$P$ 是 $0 \sim n$ 的排列。

## 思路

记 $pos[x]$ 为值 $x$ 在 $P$ 中的下标。把答案转成「至少」的形式更好算：令 $sum[i]$ 为 $\text{MEX}(L,R) \ge i$ 的区间数量，则 $\text{MEX}(L,R) = i$ 的区间数 $ans[i] = sum[i] - sum[i+1]$。

$\text{MEX}(L,R) \ge i$ 等价于 $0,1,\dots,i-1$ 全都落在 $[L,R]$ 内，即 $L \le \min\{pos[0..i-1]\}$ 且 $R \ge \max\{pos[0..i-1]\}$。维护前缀最小下标 $mn[i] = \min\{pos[0..i]\}$、前缀最大下标 $mx[i] = \max\{pos[0..i]\}$，则

$$sum[i] = mn[i-1] \cdot (len - mx[i-1] + 1), \quad i \ge 1$$

$sum[0]$ 等于区间总数 $\dfrac{len(len+1)}{2}$（$len = n+1$）。从 $i=0$ 起逐步递推 $sum[i]$ 与 $sum[i+1]$ 即得 $ans$。

复杂度：时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p => Int64.parse(p) })
    let np1 = n + 1
    let pos = Array<Int64>(np1, { _ => 0 })
    for (i in 0..np1) {
        pos[p[i]] = i + 1
    }
    let mx = Array<Int64>(np1, { _ => 0 })
    let mn = Array<Int64>(np1, { _ => 0 })
    mx[0] = pos[0]
    mn[0] = pos[0]
    for (i in 1..np1) {
        mx[i] = if (pos[i] > mx[i - 1]) { pos[i] } else { mx[i - 1] }
        mn[i] = if (pos[i] < mn[i - 1]) { pos[i] } else { mn[i - 1] }
    }
    let L = np1
    let total = L * (L + 1) / 2
    var prev = total
    for (i in 0..=n) {
        let nxt = mn[i] * (L - mx[i] + 1)
        print(prev - nxt)
        if (i < n) {
            print(" ")
        }
        prev = nxt
    }
    println()
    return 0
}
```

要点：

- 「恰好等于」难数时改数「至少」，再用差分（$ans[i] = sum[i] - sum[i+1]$）还原，是这类计数题的常用套路。
- $\text{MEX} \ge i$ 要求 $0 \sim i-1$ 全在区间内，于是只剩前缀最值这一约束，直接 $O(n)$ 扫描。
