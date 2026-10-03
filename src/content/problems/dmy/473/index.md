---
oj: dmy
pid: '473'
title: '[R76E] 灯带'
difficulty: 提高
tags:
  - 动态规划
  - 计数
  - 组合数学
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$3 \le n \le 2000$，$1 \le m < 998244353$，$1 \le k \le \min(n,m)$，$1 \le b_i \le 3$，答案对 $998244353$ 取模。

## 思路

**只关心颜色的相等关系。** 条件「连续三盏灯恰好包含 $b_i$ 种颜色」只取决于这三盏灯的颜色是否彼此相等，与颜色具体是几号无关。

于是把方案按「相等关系」拆开：一个配色方案唯一确定下标集合的一个划分——同色的灯放进同一个块，块数就是实际用到的颜色数。反过来，固定一个恰好有 $k$ 个块的划分，给这 $k$ 个块各分配一种互不相同的颜色，方案数为下降幂

$$(m)_k = m(m-1)\cdots(m-k+1).$$

设 $N_k$ 为满足所有 $b_i$ 限制、且恰好有 $k$ 个块的划分数，则答案为 $N_k \cdot (m)_k \bmod 998244353$。这样 $m$ 只出现在最后的下降幂里，$N_k$ 与 $m$ 无关。

**扫描时只需要记住「最后两盏灯是否同色」和已用块数。** 依次决定 $1,2,\dots,n$ 各自所在的块。当前位置开始的三盏灯中，后两盏 $x=a_{i-1}$、$y=a_i$ 的关系只有同色与异色两种，记状态 $s\in\{0,1\}$；再记已经用掉的块数 $t$。关键点是：块一旦出现就不会消失，之后任何位置都可以回到任意一个旧块，所以候选只有「和 $x$ 同块」「和 $y$ 同块」「其余 $t$ 个块中的某一个」「新开一个块」四类，逐类计数即可，不需要知道更早的位置细节。

- $s=1$（$x$ 与 $y$ 同块）：$z$ 与该块同色时三盏灯只含 1 种颜色，$t$ 不变且新状态 $s=1$；$z$ 取其余 $t-1$ 个旧块之一或新开一块时恰好 2 种颜色，新状态 $s=0$，$t$ 分别为不变与加一。故 $b_i=1$ 只有 1 种走法，$b_i=2$ 有 $t-1$ 种（$t$ 不变）加 1 种（$t+1$），$b_i=3$ 无解。
- $s=0$（$x$ 与 $y$ 异块）：$z$ 与 $x$ 同块或与 $y$ 同块都得到 2 种颜色（$t$ 不变，$s$ 分别为 $0,1$）；$z$ 取 $x,y$ 之外的 $t-2$ 个旧块之一或新开一块都得到 3 种颜色（$t$ 不变或加一，$s=0$）。故 $b_i=2$ 有 2 种走法，$b_i=3$ 有 $t-1$ 种走法，$b_i=1$ 无解。

注意 $s=0$ 时 $x,y$ 已占两个块，所以「其余旧块」是 $t-2$ 个；当 $t=2$ 时这部分为 $0$，只剩新开块。

**DP。** 设 $f_0[t],f_1[t]$ 表示前 $i$ 盏灯划分成 $t$ 个块、且第 $i-1$ 盏与第 $i$ 盏异色（$s=0$）或同色（$s=1$）的方案数。初始 $i=2$：两盏灯同色时 $t=1$，异色时 $t=2$。之后每加一盏灯，就按它所在三元组对应的 $b$ 套用上面的转移。因为 $t$ 只增不减，而最终必须恰好 $k$ 个块，所有 $t>k$ 的状态可以直接丢弃，$t$ 只需枚举到 $k$。

最后 $N_k = f_0[k]+f_1[k]$，再乘下降幂输出。

## 复杂度

块数只需枚举到 $k$，转移 $O(1)$，时间 $O(nk)$，空间 $O(k)$。下降幂的计算是 $O(k)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

let MOD: Int64 = 998244353

main() {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let m = head[1]
    let k = head[2]
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    var dp0 = Array<Int64>(k + 2, { _ => 0 })
    var dp1 = Array<Int64>(k + 2, { _ => 0 })
    dp1[1] = 1
    if (k >= 2) {
        dp0[2] = 1
    }
    var i: Int64 = 0
    while (i < n - 2) {
        let bv = b[i]
        var nd0 = Array<Int64>(k + 2, { _ => 0 })
        var nd1 = Array<Int64>(k + 2, { _ => 0 })
        var t: Int64 = 1
        while (t <= k) {
            let v0 = dp0[t]
            let v1 = dp1[t]
            if (bv == 1) {
                nd1[t] = (nd1[t] + v1) % MOD
            } else if (bv == 2) {
                nd0[t] = (nd0[t] + v1 * (t - 1) + v0) % MOD
                nd1[t] = (nd1[t] + v0) % MOD
                if (t + 1 <= k) {
                    nd0[t + 1] = (nd0[t + 1] + v1) % MOD
                }
            } else {
                nd0[t] = (nd0[t] + v0 * (t - 2)) % MOD
                if (t + 1 <= k) {
                    nd0[t + 1] = (nd0[t + 1] + v0) % MOD
                }
            }
            t += 1
        }
        dp0 = nd0
        dp1 = nd1
        i += 1
    }
    var ans = (dp0[k] + dp1[k]) % MOD
    var c: Int64 = 0
    while (c < k) {
        ans = ans * ((m - c) % MOD) % MOD
        c += 1
    }
    println(ans)
}
```

</details>
