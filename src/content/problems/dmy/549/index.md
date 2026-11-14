---
oj: dmy
pid: '549'
title: '排列与不等号'
difficulty: 提高
tags:
  - 前缀和优化
  - DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le N \le 3000$，字符串 $s$ 长度为 $N-1$，只含 `<` 与 `>`。

## 思路

**只关心相对次序。** 题目给的是排列，但约束全部来自相邻两数的大小关系，与具体数值无关。所以从前往后逐个确定元素时，只需要记住「已经用了几个数」以及「最后一个元素在已用的这些数里排第几小」，剩下的具体取值不影响后续决策。这正是所谓相对排名 DP。

**状态。** 设 $dp[i][j]$ 表示：长度为 $i$ 的前缀已经填好、与 $s$ 的前 $i-1$ 个字符相容，且第 $i$ 个元素在它所在的那 $i$ 个元素中排名第 $j$（$1\le j\le i$）的方案数。同一套「排名序列」对应多少种真实取值？对每个排名序列 $q_1,\dots,q_i$（$q_t$ 是第 $t$ 个元素在 $\{q_1,\dots,q_t\}$ 中的排名）恰好有一个相对序，也就对应 $1..i$ 的一个排列，因此按排名计数不会重复，也不会漏。

**转移。** 从 $i$ 扩展一位到 $i+1$，新元素插入后，旧元素中排名 $\ge$ 某个值的会整体后移一位。分两种情形：

- $s_i = $ `<`（要求 $p_i < p_{i+1}$）：新元素排名为 $j$ 时，旧的最后一个元素排名 $k$ 必须严格小于 $j$，即 $k\le j-1$。此时插在它前面，两者都保持原有排名。于是

$$dp[i+1][j]=\sum_{k=1}^{j-1} dp[i][k].$$

- $s_i = $ `>`（要求 $p_i > p_{i+1}$）：新元素排名为 $j$，则旧元素中排名 $k\ge j$ 的都会被顶到 $k+1$，仍然排在新元素后面；而排名 $k<j$ 的旧元素维持 $k$，排在新元素前面。旧的最后一个元素排在新元素之后，当且仅当它的排名 $k\ge j$，故

$$dp[i+1][j]=\sum_{k=j}^{i} dp[i][k].$$

**用前缀和压掉内层循环。** 上面两式都是对 $dp[i]$ 的一段区间求和，其中区间端点是 $j$ 或 $j-1$。先对 $dp[i][1..i]$ 求一遍前缀和 $pre$，则

$$dp[i+1][j]=\begin{cases}pre[j-1], & s_i=\texttt{<}\\ pre[i]-pre[j-1], & s_i=\texttt{>}\end{cases}$$

每个 $j$ 都是 $O(1)$，一层 $i$ 只需 $O(i)$，总计 $O(N^2)$。

**边界。** $dp[1][1]=1$（只有一个元素，排名恒为 1），其余为 0。注意 $s_i=$ `>` 时 $j=i+1$ 的值为 $pre[i]-pre[i]=0$，含义是「新元素成为最大」不可能满足 $p_i>p_{i+1}$，自动成立，不必特判。最终答案是 $\sum_{j=1}^{N}dp[N][j]$，因为所有排名都合法。

**滚动数组。** 第 $i+1$ 层只依赖第 $i$ 层的全部值，用两个一维数组交替即可，空间 $O(N)$。取模时减法要补 $10^9+7$ 防止负数。

## 复杂度

时间 $O(N^2)$，空间 $O(N)$。$N=3000$ 时约 $4.5\times10^6$ 次加法。

## 仓颉实现

排名下标从 1 开始，数组开 $N+2$，`pre[0]=0` 作为前缀和的哨兵，避免判断越界。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let rs = reader.readln().getOrThrow().toRuneArray()
    let MOD: Int64 = 1000000007
    var dp = Array<Int64>(n + 2, { _ => 0 })
    let pre = Array<Int64>(n + 2, { _ => 0 })
    dp[1] = 1
    for (i in 1..n) {
        pre[0] = 0
        for (k in 1..=i) {
            pre[k] = (pre[k - 1] + dp[k]) % MOD
        }
        let ndp = Array<Int64>(n + 2, { _ => 0 })
        if (rs[i - 1] == r'<') {
            for (j in 1..=(i + 1)) {
                ndp[j] = pre[j - 1]
            }
        } else {
            for (j in 1..=(i + 1)) {
                ndp[j] = (pre[i] - pre[j - 1] + MOD) % MOD
            }
        }
        dp = ndp
    }
    var ans: Int64 = 0
    for (j in 1..=n) {
        ans = (ans + dp[j]) % MOD
    }
    println(ans)
}
```

</details>
