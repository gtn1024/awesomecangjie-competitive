---
oj: dmy
pid: '157'
title: '[R26D]美食节'
difficulty: 提高
tags:
  - 前缀和
  - 二分
timeLimit: 1s
memoryLimit: 256m
---

## 题意

两个摊位 A、B 各有一列菜品，A 有 $n$ 道、B 有 $m$ 道。每次只能挑一个摊位，吃掉它当前最前面的那道菜，吃完即移除。每道菜有耗时和快乐值，快乐值可能为负。总时间 $K$ 内，求能获得的最大快乐值。

$n,m \le 10^5$，$K \le 10^{14}$，耗时 $\le 10^9$，快乐值 $\in [-10^9, 10^9]$。

## 思路

「只能吃当前最前面」这个限制很关键：它意味着在同一个摊位上，一旦跳过第 $i$ 道菜，就再也吃不到第 $i$ 道以后的菜。所以每个摊位实际吃掉的菜必然是一个 **前缀**。

设最终在 A 上吃了前 $a$ 道、在 B 上吃了前 $b$ 道，则需满足

$$\text{sumA}(a) + \text{sumB}(b) \le K$$

目标是最大化 $\text{sumA'}(a) + \text{sumB'}(b)$。其中 $\text{sumA}(a)$、$\text{sumA'}(a)$ 分别是 A 的前 $a$ 道菜的耗时之和、快乐值之和，B 同理。

### 枚举一边，二分另一边

预处理出两个摊位的前缀耗时与前缀快乐值。枚举 A 吃多少道（$a = 0, 1, \dots, n$）：

- A 前缀耗时 $\text{sumA}(a)$ 随 $a$ 单调递增（每道耗时 $\ge 1$），所以一旦 $\text{sumA}(a) > K$ 即可停止。
- 剩余时间 $\text{rem} = K - \text{sumA}(a)$。
- B 前缀耗时也单调递增，在 $\text{sumB}(b) \le \text{rem}$ 的范围内，二分找出最大的可行 $b_{\max}$。

### 处理负快乐值

B 的某些菜快乐值为负，所以前缀快乐 $\text{sumB'}(b)$ **不一定单调**：多贪一道负快乐菜反而变差。因此在合法范围 $[0, b_{\max}]$ 内，要的不是 $\text{sumB'}(b_{\max})$，而是 $\max_{0 \le b \le b_{\max}} \text{sumB'}(b)$。

为此再预处理一个 B 前缀快乐的最大值数组 $\text{mxB}[b] = \max_{0 \le i \le b} \text{sumB'}(i)$。于是对每个 $a$，候选答案就是

$$\text{sumA'}(a) + \text{mxB}[b_{\max}]$$

全局取最大即可。注意 $a = 0$ 表示完全不吃 A，对称地保证了「只吃 B」「两边都不吃」的情况自然被枚举到（$a=0$ 时若也都不吃 B 则快乐为 0）。

复杂度 $O(n \log m)$，$n, m \le 10^5$，1 秒内轻松通过。

### 关于枚举 A 侧

A 侧同样可能有负快乐，但因为我们枚举了 **所有** 可行的 $a$（不只是最大的那个），每种 $a$ 下 A 前缀的快乐 $\text{sumA'}(a)$ 都被纳入候选，所以 A 侧的负快乐已经被自动处理——多枚举一个 $a$ 即对应「少吃几道 A」的方案，无需对 A 单独做前缀最大值。

## 代码

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let m = head[1]
    let k = head[2]
    let at = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let av = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let bt = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let bv = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    // A 前缀：saTime[a]、saHappy[a] 表示吃前 a 道 A 菜的耗时和、快乐和
    let saTime = Array<Int64>(n + 1, { _ => 0 })
    let saHappy = Array<Int64>(n + 1, { _ => 0 })
    var i = 1
    while (i <= n) {
        saTime[i] = saTime[i - 1] + at[i - 1]
        saHappy[i] = saHappy[i - 1] + av[i - 1]
        i++
    }
    // B 前缀
    let sbTime = Array<Int64>(m + 1, { _ => 0 })
    let sbHappy = Array<Int64>(m + 1, { _ => 0 })
    var j = 1
    while (j <= m) {
        sbTime[j] = sbTime[j - 1] + bt[j - 1]
        sbHappy[j] = sbHappy[j - 1] + bv[j - 1]
        j++
    }
    // B 前缀快乐的最大值（存在负快乐菜）
    let maxHappyB = Array<Int64>(m + 1, { _ => 0 })
    maxHappyB[0] = sbHappy[0]
    var jj = 1
    while (jj <= m) {
        if (sbHappy[jj] > maxHappyB[jj - 1]) {
            maxHappyB[jj] = sbHappy[jj]
        } else {
            maxHappyB[jj] = maxHappyB[jj - 1]
        }
        jj++
    }

    var best = Int64.Min
    var a = 0
    while (a <= n) {
        if (saTime[a] > k) {
            break
        }
        let remain = k - saTime[a]
        // 二分找最大的 b，使 sbTime[b] <= remain
        var lo = 0
        var hi = m
        var bmax = 0
        while (lo <= hi) {
            let mid = (lo + hi) / 2
            if (sbTime[mid] <= remain) {
                bmax = mid
                lo = mid + 1
            } else {
                hi = mid - 1
            }
        }
        let cand = saHappy[a] + maxHappyB[bmax]
        if (cand > best) {
            best = cand
        }
        a++
    }

    println(best)
}
```

## 复杂度

- 时间：$O(n + m)$ 预处理，$O(n \log m)$ 枚举 + 二分，总体 $O(n \log m)$。
- 空间：$O(n + m)$，8 个长度 $n+1$ 或 $m+1$ 的 `Int64` 数组。
