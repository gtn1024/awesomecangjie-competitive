---
oj: dmy
pid: '449'
title: '[R72E] 集群'
difficulty: 提高
tags:
  - 并查集
  - 排序
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$n \le 2 \times 10^5$，$0 \le a_i \le 10^9$，$0 \le p_i \le 10^9$。

## 思路

第 $t$ 秒在线的位置恰好是满足 $a_i \ge t$ 的服务器。若这些位置形成的极大连续段长度依次为 $b_1, b_2, \ldots, b_k$，则这一秒完成的任务数为

$$
F(t) = \sum_{j=1}^{k} p_{b_j}.
$$

答案就是 $\sum_{t \ge 1} F(t)$。随着 $t$ 变化，在线位置集合只会在某个 $a_i$ 处发生改变，因此不必逐秒计算，只需在相邻事件值之间一次性累加贡献。

**倒推激活。**把所有位置按 $a_i$ 从大到小排序，设当前所有连续段的单秒贡献之和为 $S$。依次处理每个不同的在线时长 $v$，并激活所有满足 $a_i = v$ 的位置：

- 激活位置 $i$ 后它先单独形成长度为 $1$ 的连续段，令 $S \mathrel{+}= p_1$；
- 再检查 $i-1$ 与 $i+1$，若相邻位置已激活，则用并查集合并两个连续段：若合并前两段长度分别为 $x, y$，则

$$
S \mathrel{-}= p_x + p_y,\qquad S \mathrel{+}= p_{x+y}.
$$

处理完事件值 $v$ 后，设下一个更小的事件值为 $w$（不存在则 $w = 0$）。此时已激活的位置恰好是 $a_i \ge v$ 的所有位置，对满足 $w < t \le v$ 的所有秒，在线状态都相同，因此答案一次性增加

$$
(v - w) \cdot S.
$$

全程对 $998244353$ 取模。并查集记录每个位置所在段的长度，合并时在根上维护长度；`find` 写路径压缩。

## 复杂度

时间 $O(n \log n)$（排序主导，并查集近似线性）；空间 $O(n)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

class Active {
    let MOD: Int64 = 998244353
    var parent: Array<Int64>
    var len: Array<Int64>
    var P: Array<Int64>
    var sum: Int64

    init(parent: Array<Int64>, len: Array<Int64>, P: Array<Int64>) {
        this.parent = parent
        this.len = len
        this.P = P
        this.sum = 0
    }

    func find(x: Int64): Int64 {
        var u = x
        while (parent[u] != u) {
            parent[u] = parent[parent[u]]
            u = parent[u]
        }
        return u
    }

    func activate(i: Int64): Unit {
        parent[i] = i
        len[i] = 1
        sum = (sum + P[1]) % MOD
        if (i > 0 && parent[i - 1] != -1) {
            merge(i, i - 1)
        }
        if (i + 1 < parent.size && parent[i + 1] != -1) {
            merge(i, i + 1)
        }
    }

    func merge(x: Int64, y: Int64): Unit {
        let rx = find(x)
        let ry = find(y)
        if (rx == ry) {
            return
        }
        let lx = len[rx]
        let ly = len[ry]
        sum = ((sum - P[lx] - P[ly]) % MOD + MOD) % MOD
        sum = (sum + P[lx + ly]) % MOD
        parent[ry] = rx
        len[rx] = lx + ly
    }
}

main(): Int64 {
    let MOD: Int64 = 998244353
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ q: String => Int64.parse(q) })

    let nn = n
    var idx = Array<Int64>(nn, { i => Int64(i) })
    sort(idx, by: { x: Int64, y: Int64 =>
        if (a[x] > a[y]) {
            Ordering.LT
        } else if (a[x] < a[y]) {
            Ordering.GT
        } else {
            Ordering.EQ
        }
    })
    let P = Array<Int64>(nn + 1, { i => if (i == 0) { 0 } else { p[i - 1] } })
    let parent = Array<Int64>(nn, { _ => -1 })
    let len = Array<Int64>(nn, { _ => 0 })
    let active = Active(parent, len, P)

    var ans: Int64 = 0
    var i: Int64 = 0
    while (i < nn) {
        let v = a[idx[i]]
        if (v == 0) {
            break
        }
        while (i < nn && a[idx[i]] == v) {
            active.activate(idx[i])
            i += 1
        }
        let w = if (i < nn) { a[idx[i]] } else { 0 }
        let cnt = v - w
        ans = (ans + (cnt % MOD) * active.sum) % MOD
    }
    println(ans)
    return 0
}
```