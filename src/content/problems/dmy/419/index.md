---
oj: dmy
pid: '419'
title: '[R67E] 活动1'
difficulty: 提高
tags:
  - 状压 DP
  - 子集枚举
timeLimit: 2s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 15$，$1 \le a_T \le 10^9$。输入给出 $2^n-1$ 个子集权值，按二进制位对应编号。

## 思路

$n \le 15$，经典状压 DP。设 $dp[st][k][f]$ 表示：已分配的同学集合为 $st$，共分成 $k$ 组，$f=1$ 表示已经出现单人小组（大小为 $1$ 的小组）时的最大总效果。最终答案就是 $dp[(1 \ll n)-1][k][1]$，$k=2\dots n$。

朴素做法是枚举状态 $st$ 后再枚举 $st$ 的非空子集 $t$ 作为最新的一组，总复杂度 $O(n3^n)$，本题可过，但可以优化到 $O(3^n)$。

**关键优化（钦定枚举顺序）**：转移时钦定下一组 $t$ 必须包含**当前未分配的最小元素**。这样每一种划分方案只会被枚举一次（它的组按「包含剩余最小元素」的顺序被唯一确定），不会重复计数。于是转移为：设 $x$ 为 $st$ 外的最小元素，枚举 $t \subseteq \overline{st}$ 且 $x \in t$，转移到 $dp[st \cup t][k+1][f']$，其中 $t$ 是单人组（即 $t=x$）时 $f'=1$。

复杂度为什么是 $O(3^n)$：由于下一组总是包含未分配的最小元素，经过 $k$ 组后，最小的 $k$ 个元素必然都已分配（$st$ 的低 $k$ 位全为 $1$）。第 $k$ 层的状态数约为 $2^{n-k}$ 个，每个状态枚举剩余元素的子集，第 $k$ 层的枚举总量为：

$$
\sum_{j=0}^{n-k} \binom{n-k}{j} 2^{n-k-j-1} = \frac{3^{n-k}}{2}
$$

总枚举量 $\sum_{k=0}^{n} 3^{n-k} = O(3^n)$。

注意状态里必须带 $f$ 维：钦定顺序后不能随便把某一组放到最后，所以不能像题解 PS 里说的那样「最后强制一组为单人组」来去掉这一维，只能在 DP 里实时记录。

复杂度：时间 $O(3^n)$，空间 $O(2^n n)$（$dp$ 数组大小为 $2^n \times (n+1) \times 2$）。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow().split(" ", removeEmpty: true)[0])
    let full = (Int64(1) << n) - 1
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // a[mask - 1] 即为子集 mask 的合作效果
    let kn = n + 1
    let NEG = Int64(-1) << 62
    // dp[st][k][f]：已分配集合 st、分成 k 组，f=1 表示已出现单人小组
    let dp = Array<Int64>((full + 1) * kn * 2, { _ => NEG })
    dp[0] = 0
    var st: Int64 = 0
    while (st <= full) {
        let remaining = full ^ st
        if (remaining != 0) {
            // 钦定下一组必须包含未分配的最小元素，保证每种划分只被枚举一次
            let x = remaining & (-remaining)
            let rest = remaining ^ x
            var k: Int64 = 0
            while (k <= n) {
                let base = ((st * kn) + k) * 2
                let v0 = dp[base]
                let v1 = dp[base + 1]
                if (v0 != NEG || v1 != NEG) {
                    var sub = rest
                    while (true) {
                        let t = x | sub
                        let nst = st | t
                        let nb = ((nst * kn) + (k + 1)) * 2
                        let av = a[t - 1]
                        if (v0 != NEG) {
                            let nv = v0 + av
                            // sub == 0 时新组是单人小组，状态升级为 f=1
                            let idx = if (sub == 0) { nb + 1 } else { nb }
                            if (nv > dp[idx]) { dp[idx] = nv }
                        }
                        if (v1 != NEG) {
                            let nv = v1 + av
                            if (nv > dp[nb + 1]) { dp[nb + 1] = nv }
                        }
                        if (sub == 0) { break }
                        sub = (sub - 1) & rest
                    }
                }
                k += 1
            }
        }
        st += 1
    }
    var k: Int64 = 2
    while (k <= n) {
        println(dp[((full * kn) + k) * 2 + 1])
        k += 1
    }
}
```

要点：

- 枚举剩余元素子集用经典写法：从 `rest` 开始不断 `sub = (sub - 1) & rest`，直到 $0$，覆盖全部子集（含空集）。
- `x = remaining & (-remaining)` 取出 `remaining` 的最低二进制位，即未分配的最小元素。
- $dp$ 数组摊平成 `((st * (n+1)) + k) * 2 + f` 一维存储；`NEG = -(1 \ll 62)$` 表示不可达状态。
- 答案最大为 $15 \times 10^9$，远小于 `Int64` 上限，无需取模。
