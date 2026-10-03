---
oj: dmy
pid: '208'
title: '[R34E] 整数数组'
difficulty: 普及+/提高
tags:
  - 组合数学
  - 动态规划
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$0 \le m \le \min(n, 300)$，$0 \le r \le 300$，$1 \le n, k \le 5 \times 10^6$，$1 \le w_i \le 300$。

## 思路

把数组拆成前 $m$ 个（带上限 $w_i$）与后 $n-m$ 个两部分。设前 $m$ 个元素的和为 $S_1$，后 $n-m$ 个元素的和为 $S_2 = k - S_1$。

**后段的方案数** $g(S_2)$：后 $n-m$ 个位置中恰有 $j$ 个正数（$0 \le j \le r$）时，先选位置有 $\binom{n-m}{j}$ 种，再把 $S_2$ 拆成 $j$ 个正整数有 $\binom{S_2-1}{j-1}$ 种（$j = 0$ 时仅 $S_2 = 0$ 有 1 种）。因此

$$g(S_2) = \sum_{j=0}^{\min(r, S_2)} \binom{n-m}{j}\binom{S_2-1}{j-1}$$

**前段的方案数** $f(S_1)$：对每个 $w_i$ 做分组背包，用前缀和把单次转移优化到 $O(1)$。$\sum w_i \le 90000$，故 $S_1 \le cap = \min(\sum w_i, k) \le 90000$。

答案为 $\sum_{S_1=0}^{cap} f(S_1) \cdot g(k - S_1)$。难点是 $S_2 = k - S_1$ 可以大到 $5 \times 10^6$，不能对每个 $S_2$ 都 $O(r)$ 重算。注意到需要的是**连续的** $S_2$ 区间 $[k - cap, k]$，可以用增量递推：

记 $B_j(S) = \binom{S-1}{j-1}$，由帕斯卡恒等式有

$$B_j(S-1) = B_j(S) - B_{j-1}(S-1)$$

再记 $D_d(S) = \sum_{j=1}^{r-d} \binom{n-m}{j+d} B_j(S)$，则 $g(S) = D_0(S)$，并且

$$D_d(S-1) = D_d(S) - D_{d+1}(S-1)$$

于是从 $S_2 = k$ 出发，每次 $O(r)$ 更新整个 $D$ 数组即可得到下一个 $g$ 值；$g(0) = 1$ 单独处理。

组合数 $\binom{n-m}{j}$（$j \le 300$）用递推 $\binom{N}{j+1} = \binom{N}{j} \cdot \frac{N-j}{j+1}$ 配合逆元表预处理，初始的 $B_j(k) = \binom{k-1}{j-1}$ 同理。

## 复杂度

时间 $O(m \cdot \sum w_i + r \cdot cap) \approx O(300 \times 90000 \times 2)$，空间 $O(\sum w_i + r)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let toks = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = toks[0]
    let m = toks[1]
    let r = toks[2]
    let k = toks[3]

    var w = Array<Int64>(m, { _ => 0 })
    if (m > 0) {
        w = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    }

    // f[S1]：前 m 个元素在各自上限内和为 S1 的方案数（S1 <= cap <= 90000）
    var sumW: Int64 = 0
    for (x in w) {
        sumW += x
    }
    let cap = if (sumW < k) { sumW } else { k }
    let size = cap + 1
    var f = Array<Int64>(size, { _ => 0 })
    var pref = Array<Int64>(size, { _ => 0 })
    f[0] = 1
    var curMax: Int64 = 0
    for (wi in w) {
        let newMax = if (curMax + wi < cap) { curMax + wi } else { cap }
        pref[0] = f[0]
        var t: Int64 = 1
        while (t <= curMax) {
            pref[t] = pref[t - 1] + f[t]
            if (pref[t] >= MOD) {
                pref[t] -= MOD
            }
            t += 1
        }
        var S: Int64 = 0
        while (S <= newMax) {
            let hi = if (S < curMax) { S } else { curMax }
            let lo = S - wi
            var val = pref[hi]
            if (lo > 0) {
                val = val - pref[lo - 1]
                if (val < 0) {
                    val += MOD
                }
            }
            f[S] = val
            S += 1
        }
        curMax = newMax
    }

    // 逆元表 inv[1..r]
    var inv = Array<Int64>(r + 1, { _ => 0 })
    if (r >= 1) {
        inv[1] = 1
        var i: Int64 = 2
        while (i <= r) {
            inv[i] = MOD - (MOD / i) * inv[MOD % i] % MOD
            i += 1
        }
    }

    // C[j] = C(n - m, j)，j = 0..r
    let N2 = n - m
    var C = Array<Int64>(r + 1, { _ => 0 })
    C[0] = 1
    var j: Int64 = 0
    while (j < r) {
        if (N2 - j > 0) {
            C[j + 1] = C[j] * ((N2 - j) % MOD) % MOD * inv[j + 1] % MOD
        } else {
            C[j + 1] = 0
        }
        j += 1
    }

    // B[j] = C(k - 1, j - 1)，j = 1..r（j > k 时为 0）
    var B = Array<Int64>(r + 1, { _ => 0 })
    if (r >= 1 && k >= 1) {
        B[1] = 1
        j = 1
        while (j < r && j < k) {
            B[j + 1] = B[j] * ((k - j) % MOD) % MOD * inv[j] % MOD
            j += 1
        }
    }

    // g(S2) = sum_{j=1..r} C[j] * B[j]（S2 >= 1），g(0) = 1。
    // D[d] = sum_{j=1..r-d} C[j+d] * B[j]，g(S2) = D[0]。
    // 下降一步 S2 -> S2-1：D[d] = D[d] - D[d+1]（d 从大到小）。
    var D = Array<Int64>(r + 1, { _ => 0 })
    var d: Int64 = 0
    while (d <= r) {
        var s: Int64 = 0
        j = 1
        while (j <= r - d) {
            s = s + C[j + d] * B[j] % MOD
            if (s >= MOD) {
                s -= MOD
            }
            j += 1
        }
        D[d] = s
        d += 1
    }

    // 主循环：S1 = 0..cap，S2 = k - S1 从 k 递减到 k - cap
    var ans: Int64 = 0
    var S2 = k
    var S1: Int64 = 0
    while (S1 <= cap) {
        let g = if (S2 == 0) { 1 } else { D[0] }
        ans = ans + f[S1] * g % MOD
        if (ans >= MOD) {
            ans -= MOD
        }
        if (S2 > 0) {
            var dd: Int64 = r - 1
            while (dd >= 0) {
                D[dd] = D[dd] - D[dd + 1]
                if (D[dd] < 0) {
                    D[dd] += MOD
                }
                dd -= 1
            }
            S2 -= 1
        }
        S1 += 1
    }

    println(ans)
}
```

</details>
