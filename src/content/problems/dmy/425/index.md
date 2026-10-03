---
oj: dmy
pid: '425'
title: '[R68E] 尖塔'
difficulty: 普及+/提高
tags:
  - 贪心
  - 数据结构
timeLimit: 1.5s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le HP \le 10^{15}$，$1 \le hp \le 10^9$，$1 \le D, S, u_i, v_i, k_i, w_i \le 10^9$。

## 思路

设获胜所需打击牌数为 $T = \lceil HP / S \rceil$。若 $\sum \min(u_i, k_i) < T$，必然无解。

假设在第 $j$ 回合击杀邪教徒，则只有前 $j$ 回合会受到攻击。第 $i$ 回合打出 $s_i$ 张打击牌时，防御牌打到 $d_i = \min(v_i, k_i - s_i)$ 张永远最优（防御不会带来任何副作用），该回合受到的伤害为

$$\text{dam}_i(s_i) = \max(w_i - D \cdot d_i, 0)$$

记 $\delta_i(s) = \text{dam}_i(s - 1) - \text{dam}_i(s) \ge 0$，即第 $i$ 回合打出的第 $s$ 张打击牌带来的边际伤害。于是前 $j$ 回合的总伤害为

$$\sum_{i \le j}\text{dam}_i(s_i) = \underbrace{\sum_{i \le j}\text{dam}_i(0)}_{\text{base}(j)} + \sum_{i \le j}\sum_{s = 1}^{s_i} \delta_i(s)$$

**边际序列的结构**。令 $a_i = \lceil w_i / D \rceil$ 为完全格挡本回合攻击所需防御牌数，$u'_i = \min(u_i, k_i)$ 为本回合最多可打的打击牌数。逐项计算可得 $\delta_i(1), \dots, \delta_i(u'_i)$ 的形态：

- 前 $z_i = \max(0, \min(u'_i, k_i - \min(v_i, a_i)))$ 项为 $0$：这些打击牌完全免费，因为要么防御牌还没打满，要么伤害已被完全格挡；
- 之后至多一个部分值 $\varepsilon_i = w_i - D(a_i - 1) \in (0, D]$，当且仅当 $a_i \le v_i$ 且 $k_i \ge a_i$ 且 $u'_i \ge k_i - a_i + 1$（即格挡刚好被这张打击牌破坏）；
- 剩余项全部为 $D$。

每回合的边际序列单调不减，因此「在每回合取前缀」的约束下选取 $T$ 张打击牌的最小边际伤害和，等价于直接取**全局最小的 $T$ 个边际值**之和。

**枚举击杀回合**。随着 $j$ 增大，$\text{base}(j)$ 单调不减（新增回合至少承受 $\text{dam}_j(0)$ 点伤害），而可用的打击位变多，$T$ 个最小边际值之和单调不增。令 $F_j$ 为前 $j$ 回合免费打击位总数，则：

- 若 $F_j \ge T$，边际代价为 $0$，此后总伤害只随 $j$ 增加，无需继续扫描；
- 否则还需 $R = T - F_j$ 个付费打击位：设前 $j$ 回合共有 $p$ 个部分值 $\varepsilon$（总和 $\text{sum}\varepsilon$），若 $R \le p$，代价为前 $R$ 小的 $\varepsilon$ 之和；否则为 $\text{sum}\varepsilon + (R - p) \cdot D$。

因此只需按回合顺序扫描一次：用 Fenwick 树维护已出现 $\varepsilon$ 的计数与和（值域压缩后支持查第 $R$ 小及前缀和），实时维护 $\text{base}, F, p$，在 $\sum u'_i \ge T$ 的第一个回合起计算总伤害并取最小值，遇到 $F_j \ge T$ 即可提前结束。

最后若最小总伤害 $\le hp - 1$，答案为 $hp - $ 最小总伤害；否则输出 $-1$。注意 $(R - p) \cdot D$ 可能超出 Int64 范围，超出部分只需饱和截断（任何超过 $hp$ 的总伤害都等价于失败）。

复杂度：时间 $O(n \log n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.collection.*
import std.convert.*
import std.env.*
import std.sort.*

class Fenwick {
    let n: Int64
    var cnt: Array<Int64>
    var sm: Array<Int64>

    init(n: Int64) {
        this.n = n
        this.cnt = Array<Int64>(n + 1, { _ => 0 })
        this.sm = Array<Int64>(n + 1, { _ => 0 })
    }

    func add(i0: Int64, s: Int64): Unit {
        var i = i0
        while (i <= n) {
            cnt[i] += 1
            sm[i] += s
            i += i & (-i)
        }
    }

    func countPref(i0: Int64): Int64 {
        var i = i0
        var r: Int64 = 0
        while (i > 0) {
            r += cnt[i]
            i -= i & (-i)
        }
        return r
    }

    func sumPref(i0: Int64): Int64 {
        var i = i0
        var r: Int64 = 0
        while (i > 0) {
            r += sm[i]
            i -= i & (-i)
        }
        return r
    }

    // 最小的下标 idx（1 起），使得前缀计数 >= r
    func kth(r0: Int64): Int64 {
        var r = r0
        var idx: Int64 = 0
        var bit: Int64 = 1
        while (bit * 2 <= n) {
            bit *= 2
        }
        while (bit > 0) {
            let nxt = idx + bit
            if (nxt <= n && cnt[nxt] < r) {
                idx = nxt
                r -= cnt[nxt]
            }
            bit = bit / 2
        }
        return idx + 1
    }
}

func bsearch(a: ArrayList<Int64>, x: Int64): Int64 {
    var lo: Int64 = 0
    var hi: Int64 = a.size - 1
    while (lo <= hi) {
        let mid = (lo + hi) / 2
        let v = a[mid]
        if (v == x) {
            return mid
        }
        if (v < x) {
            lo = mid + 1
        } else {
            hi = mid - 1
        }
    }
    return -1
}

func solve(): Unit {
    let reader = getStdIn()
    let line1 = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line1[0]
    let HP = line1[1]
    let hp = line1[2]
    let D = line1[3]
    let S = line1[4]
    let T = (HP + S - 1) / S

    let uArr = Array<Int64>(n, { _ => 0 })
    let vArr = Array<Int64>(n, { _ => 0 })
    let kArr = Array<Int64>(n, { _ => 0 })
    let wArr = Array<Int64>(n, { _ => 0 })
    for (i in 0..n) {
        let l = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
        uArr[i] = l[0]
        vArr[i] = l[1]
        kArr[i] = l[2]
        wArr[i] = l[3]
    }

    let upArr = Array<Int64>(n, { _ => 0 })
    let zArr = Array<Int64>(n, { _ => 0 })
    let baseArr = Array<Int64>(n, { _ => 0 })
    let epsArr = Array<Int64>(n, { _ => 0 }) // 0 表示该回合无部分边际值；eps 恒 >= 1
    let epsList = ArrayList<Int64>()
    for (i in 0..n) {
        let u = uArr[i]
        let v = vArr[i]
        let k = kArr[i]
        let w = wArr[i]
        let up = min(u, k)
        let a = (w + D - 1) / D
        let base = max(w - D * min(v, k), 0)
        let z = max(0, min(up, k - min(v, a)))
        upArr[i] = up
        zArr[i] = z
        baseArr[i] = base
        if (a <= v && k >= a && up >= k - a + 1) {
            let eps = w - D * (a - 1)
            epsArr[i] = eps
            epsList.add(eps)
        }
    }

    sort(epsList)
    let vals = ArrayList<Int64>()
    for (e in epsList) {
        if (vals.size == 0 || vals[vals.size - 1] != e) {
            vals.add(e)
        }
    }
    let fw = Fenwick(vals.size)
    let CLAMP: Int64 = 1000000000000000000
    var baseSum: Int64 = 0
    var U: Int64 = 0
    var F: Int64 = 0
    var p: Int64 = 0
    var sumEps: Int64 = 0
    var best: Int64 = CLAMP
    for (i in 0..n) {
        baseSum += baseArr[i]
        U += upArr[i]
        F += zArr[i]
        if (epsArr[i] != 0) {
            let idx = bsearch(vals, epsArr[i]) + 1
            fw.add(idx, epsArr[i])
            p += 1
            sumEps += epsArr[i]
        }
        if (U >= T) {
            var cost: Int64 = 0
            if (F < T) {
                let R = T - F
                if (R <= p) {
                    let pos = fw.kth(R)
                    let before = fw.countPref(pos - 1)
                    cost = fw.sumPref(pos - 1) + (R - before) * vals[pos - 1]
                } else {
                    cost = sumEps
                    if (R - p > CLAMP / D) {
                        cost = CLAMP
                    } else {
                        cost += (R - p) * D
                    }
                }
            }
            if (baseSum + cost < best) {
                best = baseSum + cost
            }
            if (F >= T) {
                break
            }
        }
    }
    if (best <= hp - 1) {
        println(hp - best)
    } else {
        println(-1)
    }
}

main() {
    solve()
}
```

</details>
