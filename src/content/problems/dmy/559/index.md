---
oj: dmy
pid: '559'
title: '工作还是休息'
difficulty: 提高
tags:
  - 环形 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 5000$，$1 \le A_i \le 10^9$。

## 思路

**工作日产量只由它所在空档的长度决定。** 把环上相邻两个休息日之间连续的工作日称为一个「空档」，长度记为 $L$。某工作日若处在某空档中、是从左端休息日数起的第 $d$ 天（$1\le d\le L$），那么它左边最近的休息日恰是空档左端、右边最近的休息日恰是空档右端，距离分别为 $d$ 天与 $L+1-d$ 天。环上的「前一个 / 后一个休息日」就是空档的两端，跨周也不会出现别的休息日，所以这对距离没有歧义，产量恒为 $A_{\min(d,\,L+1-d)}$。

于是整段空档的贡献只取决于 $L$：

$$g(L)=\sum_{d=1}^{L}A_{\min(d,\,L+1-d)},\qquad g(0)=0 .$$

**把 $g(L)$ 写成闭式。** $L=2m$ 时 $\min(d,2m+1-d)$ 依次为 $1,2,\dots,m,m,\dots,2,1$；$L=2m+1$ 时依次为 $1,2,\dots,m,m+1,m,\dots,2,1$。因此

$$g(2m)=2\sum_{i=1}^{m}A_i,\qquad g(2m+1)=2\sum_{i=1}^{m}A_i+A_{m+1}.$$

用 $A$ 的前缀和即可 $O(1)$ 求出每个 $g(L)$，把 $L=0,\dots,N-1$ 全算出来只需 $O(N)$。

**把环拆成「段」。** 让每个休息日连同它顺时针方向的空档组成一段：一段占 $L+1$ 天，贡献 $g(L)$；$L=0$ 表示这个休息日与下一个休息日相邻，段长 $1$、贡献 $0$。环上选定若干休息日，就把 $N$ 天恰好分成若干段，段长之和为 $N$，总产量是各段贡献之和。

反过来，任意一组段长 $L_1,\dots,L_k$ 只要满足 $\sum (L_i+1)=N$，都能按顺序绕环摆成「休息日 + $L_i$ 个工作日」的形式，总产量正是 $\sum g(L_i)$。所以原问题等价于：用长度 $1,2,\dots,N$ 的段（长度 $L+1$ 的段价值 $g(L)$）恰好拼满 $N$ 天，最大化总价值。每种长度可以重复使用，这是一个完全背包。

**状态与转移。** $dp[s]$ 表示恰好用掉 $s$ 天时能取得的最大总产量：

$$dp[s]=\max_{0\le L\le s-1}\bigl(dp[s-1-L]+g(L)\bigr),\qquad dp[0]=0 .$$

答案是 $dp[N]$。以外层枚举段长、内层让 $s$ 从小到大递推的完全背包顺序实现即可。

**边界。** 段长 $1$（$L=0$）的段永远可以取且贡献为 $0$，因此每个 $s$ 都可达，$dp$ 全部初始化为 $0$ 就够了，不必引入负无穷。$N=1$ 时只有 $L=0$ 可用，答案为 $0$，正对应「一周只有一天且必须休息」。

**检验。** 样例 1 中 $g(0)=0$、$g(1)=A_1=1$、$g(2)=2A_1=2$，取一段 $L=2$ 得答案 $2$。$N=2$、$A=\{1,100\}$ 时两天不能都工作（否则没有休息日），只能一休一工，工作日离休息日 $1$ 天，答案是 $A_1=1$ 而非 $A_2=100$；对 $N\le 12$ 枚举全部 $2^N$ 种安排暴力对拍可以确认这一点。

## 复杂度

时间 $O(N^2)$，$N=5000$ 时约 $1.25\times 10^7$ 次转移；空间 $O(N)$。答案不超过 $(N-1)\times 10^9=5\times 10^{12}$，需要 64 位整数。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let pre = Array<Int64>(n + 1, { _ => 0 })
    for (i in 0..n) {
        pre[i + 1] = pre[i] + a[i]
    }
    let g = Array<Int64>(n, { _ => 0 })
    for (l in 1..n) {
        let m = l / 2
        var v = 2 * pre[m]
        if (l % 2 == 1) {
            v += a[m]
        }
        g[l] = v
    }
    let dp = Array<Int64>(n + 1, { _ => 0 })
    for (l in 0..n) {
        let sz = l + 1
        for (s in sz..=n) {
            let cand = dp[s - sz] + g[l]
            if (cand > dp[s]) {
                dp[s] = cand
            }
        }
    }
    println(dp[n])
}
```

</details>
