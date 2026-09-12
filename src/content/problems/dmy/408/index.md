---
oj: dmy
pid: '408'
title: '[R65F] lcp计数'
difficulty: 提高
tags:
  - DP
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n \le 2 \times 10^5$，$1 \le a_i \le n$。

## 思路

直接枚举有序对 $(u, v)$ 不可行，先把 $\text{lcp}$ 按贡献分解：

$$
\operatorname{lcp}(u, v) = \sum_{L \ge 1} [u \text{ 与 } v \text{ 的前 } L \text{ 个元素相同}]
$$

交换求和顺序，原式化为

$$
\sum_{u, v \in S} \operatorname{lcp}(u, v) = \sum_{L \ge 1} \sum_{|P| = L} \operatorname{cnt}(P)^2
$$

其中 $\operatorname{cnt}(P)$ 表示**以 $P$ 为前缀**的不同非空子序列个数。上式右边等价于：对每个不同的非空子序列 $P$（每个 $P$ 恰好贡献一次，即它作为自己的前缀），累加 $\operatorname{cnt}(P)^2$。

**计算 $\operatorname{cnt}(P)$**：设 $P$ 在数组中的**最早结束位置**为 $i$（即所有能匹配出 $P$ 的下标方案中，最后一个下标的最小值）。任意以 $P$ 为前缀的子序列 $u = P + Q$ 中，$P$ 部分结束的位置 $\ge i$，因此 $Q$ 一定是 $a[i+1..n]$ 的某个子序列（可为空）；反过来，$a[i+1..n]$ 的每个不同子序列 $Q$（含空）都对应唯一的 $u = P + Q$。所以

$$
\operatorname{cnt}(P) = a[i+1..n] \text{ 的不同子序列个数（含空序列）}
$$

**按最早结束位置统计**：设 $f[i]$ 为恰好以位置 $i$ 结束（即最早结束位置为 $i$）的不同非空子序列个数。倒数第二个元素的位置 $j$ 必须满足 $j \ge prev[i]$（$prev[i]$ 为 $a[i]$ 上一次出现的位置，首次出现则为 $0$），否则可以把最后一个元素从 $i$ 换到 $prev[i]$，得到同一个值序列，最早结束位置更小。于是

$$
f[i] = \sum_{j=prev[i]}^{i-1} f[j], \qquad f[0] = 1 \text{（空序列）}
$$

用前缀和 $pref[k] = \sum_{j=0}^{k} f[j]$ 可做到 $O(1)$ 转移：$f[i] = pref[i-1] - pref[prev[i]-1]$。

**后缀镜像**：从后往前做同样的去重计数，设 $g[i]$ 为恰好以位置 $i$ 开始（即第一个元素不能右移到下一次出现的位置 $nxt[i]$）的不同非空子序列个数，$g[n+1] = 1$ 作为空序列哨兵：

$$
g[i] = \sum_{j=i+1}^{nxt[i]} g[j]
$$

记 $suf[i] = \sum_{k=i}^{n+1} g[k]$，它恰好等于 $a[i..n]$ 的不同子序列个数（含空序列，哨兵 $g[n+1]$ 就代表空序列）。

于是以最早结束位置为 $i$ 的每个前缀 $P$ 都有 $\operatorname{cnt}(P) = suf[i+1]$，最终答案

$$
\text{Ans} = \sum_{i=1}^{n} f[i] \cdot suf[i+1]^2
$$

## 复杂度

两次线性 DP，均摊 $O(1)$ 转移。时间复杂度 $O(n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let nn = n
    // prev[i]：a[i] 上一次出现的位置，首次出现则为 0
    var prev = Array<Int64>(nn + 1, { _ => 0 })
    var last = Array<Int64>(nn + 1, { _ => 0 })
    for (i in 1..=nn) {
        prev[i] = last[a[i - 1]]
        last[a[i - 1]] = i
    }
    // nxt[i]：a[i] 下一次出现的位置，最后一次出现则为 n + 1
    var nxt = Array<Int64>(nn + 2, { _ => 0 })
    var last2 = Array<Int64>(nn + 1, { _ => nn + 1 })
    var i = nn
    while (i >= 1) {
        nxt[i] = last2[a[i - 1]]
        last2[a[i - 1]] = i
        i -= 1
    }
    // f[i]：恰好以位置 i 结尾（最早结束位置为 i）的不同非空子序列个数
    // f[0] = 1 代表空序列；f[i] = sum_{j=prev[i]}^{i-1} f[j]，前缀和优化
    var f = Array<Int64>(nn + 1, { _ => 0 })
    var pref = Array<Int64>(nn + 1, { _ => 0 })
    f[0] = 1
    pref[0] = 1
    for (i in 1..=nn) {
        var x = pref[i - 1]
        if (prev[i] > 0) {
            x -= pref[prev[i] - 1]
        }
        if (x < 0) {
            x += MOD
        }
        f[i] = x
        pref[i] = (pref[i - 1] + f[i]) % MOD
    }
    // g[i]：恰好以位置 i 开始（最新开始位置为 i）的不同非空子序列个数
    // g[n+1] = 1 代表空序列；g[i] = sum_{j=i+1}^{nxt[i]} g[j]
    // sufg[i] = sum_{k=i}^{n+1} g[k]，即 a[i..n] 的不同子序列数（含空序列）
    var g = Array<Int64>(nn + 2, { _ => 0 })
    var sufg = Array<Int64>(nn + 3, { _ => 0 })
    g[nn + 1] = 1
    sufg[nn + 1] = 1
    var j = nn
    while (j >= 1) {
        var x = sufg[j + 1] - sufg[nxt[j] + 1]
        if (x < 0) {
            x += MOD
        }
        g[j] = x
        sufg[j] = (sufg[j + 1] + g[j]) % MOD
        j -= 1
    }
    // 答案 = sum_i f[i] * sufg[i+1]^2
    var ans: Int64 = 0
    for (i in 1..=nn) {
        let t = sufg[i + 1] * sufg[i + 1] % MOD
        ans = (ans + f[i] * t) % MOD
    }
    println(ans)
}
```
