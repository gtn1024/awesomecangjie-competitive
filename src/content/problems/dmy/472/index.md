---
oj: dmy
pid: '472'
title: '[R76D] 检修顺序'
difficulty: 提高
tags:
  - 贪心
  - 前缀和
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$2 \le n \le 2\times10^5$，$0 \le l_i \le r_i \le 10^9$。

## 思路

**固定顺序的可行性判据。** 对给定的一段工作顺序，想让时刻严格递增，贪心地取每个时刻尽量小最优：$t_1 = l_1$，$t_i = \max(l_i,\ t_{i-1}+1)$。该顺序可行当且仅当每个 $t_i \le r_i$。把 $t_i$ 展开得 $t_i = \max_{p \le i}\,(l_p + i - p)$，于是可行当且仅当对任意 $p \le i$ 都有 $l_p + (i-p) \le r_i$，即

$$l_p - p \le r_i - i .$$

记 $A_i = l_i - i$、$B_i = r_i - i$，判据就是「每个位置 $i$ 的前缀最大值不超过 $B_i$」。

**交换位置 $k$ 后的三段结构。** 交换后顺序是 $1,2,\dots,k-1,\ k+1,\ k,\ k+2,\dots,n$，可以看成四段：前缀 $1..k-1$、单独的第 $k+1$ 项、单独的第 $k$ 项、后缀 $k+2..n$。三段之间的条件都是

$$(\text{前一段的最晚时刻}) + 1 \le (\text{后一段的最早时刻}),$$

而每段内部仍是上面的前缀最大值判据。

**前缀段。** $1..k-1$ 内部可行，当且仅当 $P_q = \max_{p \le q} A_p$ 满足 $P_q \le B_q$ 对所有 $q \le k-1$ 成立。前缀越长越难满足，所以只需记录**第一个**违反的位置 $\mathrm{firstBad}$：前缀可行当且仅当 $k \le \mathrm{firstBad}$（不存在违反时 $\mathrm{firstBad} = n+1$）。

前缀段塞满后，第 $k-1$ 项的最早时刻为

$$F_{k-1} = \max_{p \le k-1}\bigl(l_p + (k-1-p)\bigr) = (k-1) + P_{k-1},$$

$k=1$ 时前缀为空，视 $F_0 = -\infty$。

**中间两项。** 把第 $k+1$ 项放到位置 $k$：

$$u = \max\bigl(l_{k+1},\ F_{k-1}+1\bigr) \le r_{k+1},$$

再把第 $k$ 项放到位置 $k+1$：

$$v = \max\bigl(l_k,\ u+1\bigr) \le r_k .$$

**后缀段。** 位置 $k+2$ 及其后的项都在原位，第 $j$ 项的时刻下界是 $\max\bigl(v + (j-k-1),\ \max_{k+2 \le p \le j}(l_p + j - p)\bigr)$，要求它不超过 $r_j$，两边同减 $j$ 得：对一切 $j \ge k+2$，

$$\max\Bigl(v-(k+1),\ \max_{k+2 \le p \le j} A_p\Bigr) \le B_j .$$

后半部分与 $v$ 无关，就是「后缀 $k+2..n$ 自身可行」。后缀自身可行等价于从右往左贪心的最晚安排 $t_i = \min(r_i,\ t_{i+1}-1)$ 处处不小于 $l_i$；展开得 $t_i = i + \min_{q \ge i} B_q$，故可行当且仅当对一切 $i \ge k+2$ 有 $A_i \le \min_{q \ge i} B_q$。后缀越短越容易可行，于是只需记录**最后一个**违反的位置 $\mathrm{lastBad}$：后缀可行当且仅当 $k+2 > \mathrm{lastBad}$。

前半部分则是 $v - (k+1) \le \min_{q \ge k+2} B_q$。

四组条件都只依赖 $k$ 的邻域，预处理 $P$ 的前缀最大值、$B$ 的后缀最小值、$\mathrm{firstBad}$、$\mathrm{lastBad}$ 后 $\Theta(1)$ 判断每个 $k$ 即可。

## 复杂度

时间 $O(n)$，空间 $O(n)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

const NEG: Int64 = -(1 << 60)
const INF: Int64 = 1 << 60

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let l = Array<Int64>(n + 2, { _ => 0 })
    let r = Array<Int64>(n + 2, { _ => 0 })
    var i: Int64 = 1
    while (i <= n) {
        let p = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ s: String => Int64.parse(s) })
        l[i] = p[0]
        r[i] = p[1]
        i += 1
    }
    // pm[i] = max_{q<=i}(l_q - q)，firstBad 为最早使前缀不可行的位置
    let pm = Array<Int64>(n + 2, { _ => 0 })
    pm[0] = NEG
    var firstBad: Int64 = n + 1
    i = 1
    while (i <= n) {
        let a = l[i] - i
        let v = if (pm[i - 1] > a) { pm[i - 1] } else { a }
        pm[i] = v
        if (firstBad == n + 1 && v > r[i] - i) {
            firstBad = i
        }
        i += 1
    }
    // sm[i] = min_{q>=i}(r_q - q)，lastBad 为最晚使后缀不可行的起始位置
    let sm = Array<Int64>(n + 3, { _ => 0 })
    sm[n + 1] = INF
    var lastBad: Int64 = 0
    i = n
    while (i >= 1) {
        let b = r[i] - i
        sm[i] = if (sm[i + 1] < b) { sm[i + 1] } else { b }
        if (l[i] - i > sm[i]) {
            if (lastBad < i) {
                lastBad = i
            }
        }
        i -= 1
    }
    var cnt: Int64 = 0
    var k: Int64 = 1
    while (k < n) {
        var ok = k <= firstBad
        if (ok) {
            let base = (k - 1) + pm[k - 1]
            let u = if (l[k + 1] > base + 1) { l[k + 1] } else { base + 1 }
            ok = u <= r[k + 1]
            if (ok) {
                let v = if (l[k] > u + 1) { l[k] } else { u + 1 }
                ok = v <= r[k]
                if (ok && k + 2 <= n) {
                    ok = k + 2 > lastBad && v - (k + 1) <= sm[k + 2]
                }
            }
        }
        if (ok) {
            cnt += 1
        }
        k += 1
    }
    println(cnt)
}
```

</details>
