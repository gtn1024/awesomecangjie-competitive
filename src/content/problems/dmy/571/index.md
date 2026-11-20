---
oj: dmy
pid: '571'
title: '怪物'
difficulty: 普及-
tags:
  - 贪心
  - 滑动窗口
timeLimit: 1s
memoryLimit: 512m
---

$n$ 只怪物排成一行，先任意次普通攻击（每次令一只存活怪物生命值减 $1$），再至多放一次法术：选一段长度不超过 $k$ 的编号区间 $[l,r]$，同时消灭区间内所有当前生命值恰为 $x$ 的怪物。求消灭全部怪物的最少普通攻击次数。

> 数据规模：$1\le k\le n\le 2\times 10^5$，$1\le x,h_i\le 10^9$。

## 思路

普通攻击都发生在施法之前，因此一只怪物能否被法术消灭，完全取决于我们把它预先打到了多少血。

- 若 $h_i\ge x$：可以先把它打到恰好 $x$ 点血（花 $h_i-x$ 次攻击），再等法术收割；比起直接打死（$h_i$ 次），恰好节省 $x$ 次攻击。
- 若 $h_i<x$：生命值只会减小，永远不可能等于 $x$，法术对它无效，只能花 $h_i$ 次攻击直接打死，节省为 $0$。

于是固定法术区间 $[l,r]$（$r-l+1\le k$）时的最少总攻击数为

$$\sum_{i=1}^{n} h_i \;-\; x\cdot\#\{\,i\in[l,r] \mid h_i\ge x\,\}.$$

前一项是定值，只需最大化窗口内满足 $h_i\ge x$ 的怪物个数。将 $h_i\ge x$ 的位置视为 $1$、其余视为 $0$，用长度不超过 $k$ 的滑动窗口扫一遍取最大计数即可，时间复杂度 $O(n)$。若最大计数为 $0$（所有 $h_i<x$），答案就是 $\sum h_i$，对应不放法术。

以样例 $2$ 验证：$h=[4,1,4,1]$，$k=3$，$x=4$，窗口 $[1,3]$ 内有两个 $h_i\ge 4$，答案 $10-4\times 2=2$。

## 代码

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let k = first[1]
    let x = first[2]
    let h = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    var total: Int64 = 0
    for (i in 0..n) {
        total += h[i]
    }
    var cnt: Int64 = 0
    var best: Int64 = 0
    var left: Int64 = 0
    for (r in 0..n) {
        if (h[r] >= x) {
            cnt += 1
        }
        while (r - left + 1 > k) {
            if (h[left] >= x) {
                cnt -= 1
            }
            left += 1
        }
        if (cnt > best) {
            best = cnt
        }
    }
    println(total - best * x)
}
```
