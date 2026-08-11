---
oj: dmy
pid: '293'
title: '[R47E]集合'
difficulty: 提高
tags:
  - 二分
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

## 题目

$n$ 只兔子在数轴上，第 $i$ 只坐标为 $a_i$（已保证非降序），每秒最多移动 $1$ 单位。最多使用 $k$ 次魔法，每次可让一只兔子瞬移最多 $x$ 单位，**每只兔子至多被魔法选中一次**。要求选一个整数坐标作为集合点，使所有兔子在同一位置集合的最少秒数。保证所有 $a_i$ 与 $x$ 均为偶数。

> 对于 $100\%$ 的数据：$1\le n\le 10^5$，$0\le k\le n$，$0\le x\le 10^9$，$0\le a_1\le\cdots\le a_n\le 10^9$。

## 思路

二分答案 $T$（最少秒数），问题转化为判定：能否在 $T$ 秒内、使用不超过 $k$ 次魔法，让所有兔子到达某个整数坐标 $p$。

设集合点为 $p$。一只兔子到 $p$ 的距离是 $|a_i-p|$：

- 不用魔法时，能走的距离就是 $T$，因此需要 $|a_i-p|\le T$；
- 用一次魔法时，走 $T$ 加上瞬移 $x$，因此需要 $|a_i-p|\le T+x$。

由于每只兔子至多用一次魔法、共至多 $k$ 次，所以合法 $p$ 必须满足：

1. **覆盖**：所有兔子都在 $p$ 的 $T+x$ 范围内，即 $\max a-\min a\le 2(T+x)$，且 $p\in[\max a-(T+x),\ \min a+(T+x)]$；
2. **窗口**：不需要魔法的兔子（即落在 $[p-T,p+T]$ 内的）至少有 $n-k$ 只，这样最多剩下 $k$ 只用魔法补足。

剩下就是快速判断「是否存在合法 $p$ 同时满足上述两条」。由于 $a$ 已排序，保留下来不使用魔法的兔子必然是一段连续子数组 $a[l..j]$（其余从左、右两端删掉）。枚举左侧删掉 $l$ 只（$0\le l\le k$），则右侧至多删 $k-l$ 只；要让保留的窗口尽量窄，$j$ 取满足「保留数量 $\ge n-k$、且右侧删掉数量 $\le k-l$」的最小值：

$$
j=\max(l+(n-k)-1,\ (n-1)-(k-l)).
$$

只需检查这段最窄窗口能否塞进宽度 $2T$ 的聚集窗口，即 $a[j]-a[l]\le 2T$；同时聚集点 $p$ 必须落在窗口中心可行区间 $[a[j]-T,\ a[l]+T]$ 与覆盖可行区间 $[\max a-(T+x),\ \min a+(T+x)]$ 的交集内，二者相交即可。

特判 $n-k\le 0$（魔法次数够给所有兔子用）：此时聚集窗口内的兔子数条件恒成立，只需覆盖可行即可。

每个 `check` 是 $O(k)$（即 $O(n)$），外层二分 $O(\log V)$，总复杂度 $O(n\log V)$，$V=10^9$。

## 代码

```cangjie
import std.convert.*
import std.console.*
import std.sort.*

main(): Int64 {
    let reader = Console.stdIn
    let line = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = line[0]
    let k = line[1]
    let x = line[2]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    sort(a)
    let minA = a[0]
    let maxA = a[n - 1]
    let need = n - k // 至少保留的兔子数
    var lo = Int64(0)
    var hi = Int64(2000000005) // > 10^9
    while (lo < hi) {
        let mid = (lo + hi) / Int64(2)
        if (check(mid, n, k, x, a, minA, maxA, need)) {
            hi = mid
        } else {
            lo = mid + Int64(1)
        }
    }
    println(lo)
    return 0
}

func check(T: Int64, n: Int64, k: Int64, x: Int64, a: Array<Int64>, minA: Int64, maxA: Int64, need: Int64): Bool {
    // 覆盖可行性：所有兔子必须能被走路 T + 魔法 x 覆盖，range <= 2(T+x)
    if (maxA - minA > Int64(2) * (T + x)) {
        return false
    }
    let covLo = maxA - (T + x)
    let covHi = minA + (T + x)
    // 特判：need <= 0 表示魔法次数足够给所有兔子用，只要覆盖可行即可，
    // 且聚集点 p 取覆盖区间内任意一点都满足（窗口内兔子数 >= 0 恒成立）。
    if (need <= Int64(0)) {
        return covLo <= covHi
    }
    // 枚举左侧删除 l
    var l = Int64(0)
    while (l <= k) {
        if (l > n - Int64(1)) {
            break
        }
        // 保留从下标 l 起，至少 need 个 => j >= l+need-1
        let jmin = l + need - Int64(1)
        if (jmin > n - Int64(1)) {
            l++
            continue
        }
        // 右侧删除 = n-1-j <= k-l => j >= n-1-(k-l)
        var jlo = jmin
        let bound = n - Int64(1) - (k - l)
        if (bound > jlo) {
            jlo = bound
        }
        // jlo < n
        if (jlo <= n - Int64(1)) {
            // 窗口宽度
            if (a[jlo] - a[l] <= Int64(2) * T) {
                // 中心可行区间 [a[jlo]-T, a[l]+T] 与 [covLo,covHi] 相交
                let pLo = a[jlo] - T
                let pHi = a[l] + T
                if (pHi >= covLo && pLo <= covHi) {
                    return true
                }
            }
        }
        l++
    }
    return false
}
```
