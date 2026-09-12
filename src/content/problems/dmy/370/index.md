---
oj: dmy
pid: '370'
title: '[R59E] 01序列'
difficulty: 中等
tags:
  - 前缀和
  - 组合计数
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$4 \le n \le 2 \times 10^5$。

## 思路

一个 `0110` 子序列由四个位置 $i < j < k < l$ 构成，满足 $S_i = 0, S_j = S_k = 1, S_l = 0$。某个连续子串 $[L, R]$ 包含这四元组，当且仅当 $L \le i$ 且 $R \ge l$：$L$ 有 $i$ 种选法（$1 \ldots i$），$R$ 有 $n - l + 1$ 种选法（$l \ldots n$）。因此答案等于所有合法四元组的 $i \cdot (n - l + 1)$ 之和。

从左到右扫描 $S$（位置从 $1$ 起），维护三个量：

- $zsum$：已扫描的 $0$ 的位置之和，即 $\sum_{i < p, S_i = 0} i$；
- $jsum$：所有满足 $i < j$、$S_i = 0$、$S_j = 1$ 的二元组的 $i$ 之和；
- $ab$：所有满足 $i < j < k$、$S_i = 0$、$S_j = S_k = 1$ 的三元组的 $i$ 之和，其中 $k$ 取已扫描到的位置。

扫描到位置 $p$ 时：

- 若 $S_p = 0$：以 $p$ 作为四元组的 $l$，贡献为 $ab \cdot (n - p + 1)$，累加进答案；随后 $zsum \mathrel{+}= p$；
- 若 $S_p = 1$：先执行 $ab \mathrel{+}= jsum$（把 $p$ 当作 $k$，$j$ 只能取 $p$ 之前的 $1$），再执行 $jsum \mathrel{+}= zsum$（把 $p$ 当作 $j$，$i$ 取 $p$ 之前的 $0$）。顺序不能颠倒。

$jsum$ 与 $ab$ 始终对 $998244353$ 取模即可。

复杂度：时间 $O(n)$，空间 $O(1)$。

## 仓颉实现

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let s = reader.readln().getOrThrow()
    let arr = s.toRuneArray()
    let MOD: Int64 = 998244353
    // zsum: 已扫描的 0 的位置（1 起下标）之和
    // jsum: 所有 (0 的位置 i, 1 的位置 j)，i < j 的 i 之和
    // ab: 所有满足 i < j < k 且 S[i]=0、S[j]=S[k]=1 的三元组的 i 之和
    var zsum: Int64 = 0
    var jsum: Int64 = 0
    var ab: Int64 = 0
    var ans: Int64 = 0
    for (p in 0..n) {
        if (arr[p] == r'0') {
            ans = (ans + ab * (n - p)) % MOD
            zsum += p + 1
        } else {
            ab = (ab + jsum) % MOD
            jsum = (jsum + zsum) % MOD
        }
    }
    println(ans)
}
```
