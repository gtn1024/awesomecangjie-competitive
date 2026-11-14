---
oj: dmy
pid: '565'
title: '活跃的幼儿'
difficulty: 提高
tags:
  - 区间 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le N \le 2000$，$1 \le A_i \le 10^9$。

## 思路

**先看清目标。** 一次重排就是把 $N$ 名幼儿一一放到位置 $1 \sim N$，第 $i$ 名幼儿放到位置 $j$ 贡献 $A_i|i-j|$。

**关键结论：存在一种最优方案，使得把幼儿按活跃度从大到小依次安排时，每一次安排的这名幼儿都落在当前尚未安排的那些空位所组成区间的左端或右端。**

用交换论证可以证明。设当前剩余空位是连续区间 $[l,r]$，其中活跃度最大的是幼儿 $m$（活跃度 $A_m$，原位置 $i$），它在某个最优方案里被放到了位置 $j$，于是 $l \le j \le r$。显然其余任何幼儿的活跃度都不超过 $A_m$。

- 若 $j \le i$：把 $m$ 改放到 $l$，并把原本站在 $l$ 的幼儿 $b$（原位置 $i_b$）改放到 $j$。$m$ 的位移由 $i-j$ 变成 $i-l$，因为 $j \le i$，它的快乐值恰好增加 $A_m\big((i-l)-(i-j)\big)=A_m(j-l)$。$b$ 的位移由 $|i_b-l|$ 变成 $|i_b-j|$，由三角不等式 $|i_b-j| \ge |i_b-l|-(j-l)$，它最多减少 $A_b(j-l) \le A_m(j-l)$。两项相抵，总和不变小。
- 若 $j > i$：对称地把 $m$ 改放到 $r$，原来站在 $r$ 的幼儿改放到 $j$，同样不变小。

这说明「最大活跃度的幼儿一定可以站在剩余区间端点」；换过去以后问题规模减一，剩余空位仍是连续区间，归纳下去就得到上面的结论。活跃度相同的幼儿先后次序任意，上面的推导在等号处依然成立。

**状态定义。** 把幼儿按活跃度降序排成 $A_0 \ge A_1 \ge \dots \ge A_{N-1}$，记 $pos_k$ 为第 $k$ 名幼儿的原位置。设

$$dp[l][r] = \text{已安排前 } k=N-(r-l+1) \text{ 名幼儿、剩余空位恰为 } [l,r] \text{ 时，这些已安排幼儿贡献的最大总和。}$$

已安排的幼儿占据的位置正是 $[1,l-1]\cup[r+1,N]$，所以只要知道区间 $[l,r]$ 就能完成转移。

**转移。** 按约定，第 $k = N-(r-l+1)$ 名幼儿（活跃度排第 $k$ 位的那位）应当落在 $l$ 或 $r$：

$$dp[l][r]=\max\big(dp[l+1][r]+A_k|pos_k-l|,\ dp[l][r-1]+A_k|pos_k-r|\big).$$

**边界与答案。** 区间长度为 $1$ 时只剩一个空位 $l$，最后一名幼儿（$k=N-1$）只能落在 $l$：

$$dp[l][l]=A_{N-1}|pos_{N-1}-l|.$$

答案取 $dp[1][N]$。递推按区间长度从小到大进行，长度 $L$ 只依赖长度 $L-1$。

**数值范围。** 单人贡献最大 $10^9 \times 1999$，总和不超过 $2000 \times 10^9 \times 2000 \approx 4\times 10^{15}$，用 64 位整数即可。

## 复杂度

共 $O(N^2)$ 个状态，每个状态常数次转移，时间 $O(N^2)$；存储 $dp$ 表空间 $O(N^2)$（$N=2000$ 时约 $32$ MB）。

## 仓颉实现

二维表按一维数组存储，下标为 $l\cdot(N+2)+r$。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*
import std.sort.*

func diff(x: Int64, y: Int64): Int64 {
    if (x > y) {
        x - y
    } else {
        y - x
    }
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let kids = Array<(Int64, Int64)>(n, { i => (a[i], i + 1) })
    sort(kids, key: { k => k[0] }, descending: true)
    let w = n + 2
    let dp = Array<Int64>(w * w, { _ => 0 })
    let last = kids[n - 1]
    for (l in 1..=n) {
        dp[l * w + l] = last[0] * diff(last[1], l)
    }
    for (len in 2..=n) {
        let kid = kids[n - len]
        let v = kid[0]
        let p = kid[1]
        for (l in 1..=(n - len + 1)) {
            let r = l + len - 1
            let fromLeft = dp[(l + 1) * w + r] + v * diff(p, l)
            let fromRight = dp[l * w + r - 1] + v * diff(p, r)
            dp[l * w + r] = if (fromLeft > fromRight) { fromLeft } else { fromRight }
        }
    }
    println(dp[w + n])
}
```

</details>
