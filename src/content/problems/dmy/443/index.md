---
oj: dmy
pid: '443'
title: '[R71E] 果肆连赠'
difficulty: 普及/提高-
tags:
  - 动态规划
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$n \le 500$，$k \le 10^9$，$a_i \le 10^9$。

## 思路

每张优惠券把价格变为 $\lfloor p / 2 \rfloor$，因此一个水果使用 $c$ 张券后的价格就是 $\lfloor a_i / 2^c \rfloor$，**只取决于用券数**。又因为 $a_i \le 10^9 < 2^{30}$，用 $30$ 张券价格必为 $0$（价格为 $0$ 时不能再用券），所以每个水果的有效用券数为 $0 \sim 30$，总有效券数至多 $30n$，可以把 $k$ 截断为 $K = \min(k, 30n)$。

免费获得规则是单向传递的：水果 $1$ 只能购买；若 $a_i' \ge a_{i+1}'$ 则 $i+1$ 免费，否则必须购买 $i+1$。于是总花费为

$$
a_1' + \sum_{i=1}^{n-1} [a_i' < a_{i+1}'] \cdot a_{i+1}'.
$$

从前往后做 DP：$f[t][c]$ 表示处理到当前水果，一共用了 $t$ 张券、**当前水果**用了 $c$ 张券时的最小花费（滚动数组，只保留最后一层）。转移时枚举下一个水果的用券数 $c_2$，其价格 $X = \lfloor a_{i+1} / 2^{c_2} \rfloor$：若当前水果价格 $\ge X$ 则免费，花费不变；否则要额外支付 $X$。

转移需要 $\min_c f[t][c] + [a_i(c) < X] \cdot X$。由于 $a_i(c)$ 随 $c$ 单调不增，存在分界点 $b$：$c < b$ 时 $a_i(c) \ge X$（免费），$c \ge b$ 时 $a_i(c) < X$（付费）。所以对每层预处理 $f[t][c]$ 关于 $c$ 的**前缀最小值**与**后缀最小值**，即可在 $O(1)$ 内完成每个 $(t, c_2)$ 的转移。

## 复杂度

时间 $O(n \cdot K \cdot 31)$，其中 $K = \min(k, 30n) \le 15000$；空间 $O(K \cdot 31)$（滚动数组）。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main(): Int64 {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let k0 = first[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // 每个水果最多 30 张券就降到 0（a_i <= 1e9 < 2^30），再多的券没有意义
    let C: Int64 = 31
    var T = k0
    if (T > 30 * n) {
        T = 30 * n
    }

    // val[i][c] = 水果 i 使用 c 张券后的价格 = floor(a_i / 2^c)
    var val = Array<Array<Int64>>(n, { x: Int64 => Array<Int64>(C, { y: Int64 => 0 }) })
    var i: Int64 = 0
    while (i < n) {
        var v = a[i]
        var c: Int64 = 0
        while (c < C) {
            val[i][c] = v
            v = v / 2
            c += 1
        }
        i += 1
    }

    // 最小总花费 = a_1' + sum_{i=1}^{n-1} [a_i' < a_{i+1}'] * a_{i+1}'
    // f[t][c]（滚动）: 处理到当前水果，共用 t 张券、当前水果用 c 张，最小花费
    let INF: Int64 = 1 << 60
    let size = (T + 1) * C
    var cur = Array<Int64>(size, { x: Int64 => INF })
    var nxt = Array<Int64>(size, { x: Int64 => INF })
    var pref = Array<Int64>(size, { x: Int64 => INF })
    var suff = Array<Int64>(size, { x: Int64 => INF })
    var c: Int64 = 0
    while (c < C) {
        if (c <= T) {
            cur[c * C + c] = val[0][c]
        }
        c += 1
    }

    var idx: Int64 = 0
    while (idx < n - 1) {
        var maxT = 30 * (idx + 1)
        if (maxT > T) {
            maxT = T
        }
        // pref[t][c] = min_{c'<=c} cur[t][c']，suff[t][c] = min_{c'>=c} cur[t][c']
        var t: Int64 = 0
        while (t <= maxT) {
            let base = t * C
            var m = INF
            c = 0
            while (c < C) {
                if (cur[base + c] < m) {
                    m = cur[base + c]
                }
                pref[base + c] = m
                c += 1
            }
            m = INF
            c = C - 1
            while (c >= 0) {
                if (cur[base + c] < m) {
                    m = cur[base + c]
                }
                suff[base + c] = m
                c -= 1
            }
            t += 1
        }
        // 转移：水果 idx+1 用 c2 张券，价格为 X
        // 若当前水果价格 >= X 则免费（不增加花费），否则需购买（增加 X）
        // bd = 最小的 c 使 val[idx][c] < X，val[idx][c] 随 c 非增，故可分两段取最小值
        var c2: Int64 = 0
        while (c2 < C) {
            let X = val[idx + 1][c2]
            var bd: Int64 = 0
            while (bd < C && val[idx][bd] >= X) {
                bd += 1
            }
            var tlim = maxT
            if (tlim > T - c2) {
                tlim = T - c2
            }
            t = 0
            while (t <= tlim) {
                let base = t * C
                var best: Int64
                if (bd == 0) {
                    best = suff[base] + X
                } else if (bd >= C) {
                    best = pref[base + C - 1]
                } else {
                    let p1 = pref[base + bd - 1]
                    let p2 = suff[base + bd] + X
                    if (p1 < p2) {
                        best = p1
                    } else {
                        best = p2
                    }
                }
                let nb = (t + c2) * C + c2
                if (best < nxt[nb]) {
                    nxt[nb] = best
                }
                t += 1
            }
            c2 += 1
        }
        // 交换 cur/nxt，并把 nxt 重置为 INF
        let tmp = cur
        cur = nxt
        nxt = tmp
        var j: Int64 = 0
        while (j < size) {
            nxt[j] = INF
            j += 1
        }
        idx += 1
    }

    var ans = INF
    var t2: Int64 = 0
    while (t2 <= T) {
        let base = t2 * C
        c = 0
        while (c < C) {
            if (cur[base + c] < ans) {
                ans = cur[base + c]
            }
            c += 1
        }
        t2 += 1
    }
    println(ans)
    return 0
}
```
