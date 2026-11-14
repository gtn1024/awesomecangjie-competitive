---
oj: dmy
pid: '564'
title: '座椅搬迁'
difficulty: 提高
tags:
  - 线性 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$2 \le n \le 5000$，$a_i \in \{0,1\}$，初始坐人的椅子数 $k \le \lfloor n/2 \rfloor$。

## 思路

**人最终只能停在初始为空的位置上。** 目标要求每把初始有人的椅子最后都空着，所以结束时所有 $k$ 个人站的椅子都必须是初始空位，且互不相同。反过来说，只要给每个人指定一把互不相同的初始空位并直接走过去，就能达成目标：目标椅初始就是空的，不会被别人占着，中途也不会经过依赖。

**答案就是最小权完美匹配。** 把第 $p$ 个人的移动序列看成一串位移，由三角不等式，这一段走法的总长不小于起点到终点的距离，所以任何方案的总时间都不小于「起点—终点」距离之和；直接把每个人移到终点即可取到等号。于是问题化为：从 $m$ 把初始空位中选出 $k$ 把，与 $k$ 个初始占用位置一一配对，使距离之和最小。

**一维匹配按顺序配对最优。** 设占用位置 $o_1 < o_2 < \cdots < o_k$，被选中的空位 $e_1 < e_2 < \cdots < e_k$。若存在交叉配对 $o_i \to e_b$、$o_j \to e_a$（$i<j$、$a<b$），交换成 $o_i \to e_a$、$o_j \to e_b$ 不会更差，因为数轴上两点间的距离满足 $|o_i-e_a|+|o_j-e_b| \le |o_i-e_b|+|o_j-e_a|$。所以配对关系可以不交叉地一路向右推进。

**状态与转移。** 把占用位置和初始空位都按坐标排好序，只关心「前若干个人」与「前若干把空位」，做扫描式的选择：

- $dp[i][j]$：前 $i$ 个占用位置匹配到前 $j$ 把初始空位中的某 $i$ 把时，最小距离和；
- 若不使用第 $j$ 把空位，$dp[i][j] \leftarrow dp[i][j-1]$；
- 若使用第 $j$ 把空位，按顺序配对它就接第 $i$ 个人，$dp[i][j] \leftarrow dp[i-1][j-1] + |o_i - e_j|$。

边界 $dp[0][j] = 0$（没人可配），而 $j < i$ 的状态不可能，视为不可达。答案 $dp[k][m]$，其中 $m$ 是初始空位数。

**一维滚动。** 转移只依赖上一行的 $dp[i-1][j-1]$ 与本行的 $dp[i][j-1]$，用一维数组按 $j$ 递增更新即可：更新 $dp[j]$ 前先把它旧的（上一行）值存进临时变量作为下一步的 $dp[i-1][j-1]$，而 $dp[j-1]$ 此时已经是本行的值。注意 $j=i$ 时 $dp[i][i-1]$ 不存在，必须直接由 $dp[i-1][i-1]$ 转移，不能取 $\min$。

## 复杂度

状态数 $O(k m) \le O(n^2/4)$，转移 $O(1)$，时间 $O(nk)$（约 $6.25 \times 10^6$ 次操作），空间 $O(n)$。

## 仓颉实现

排序后只需扫描一遍原始序列即可把占用位置与空位分别收集成递增数组，无需再排序。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.convert.*
import std.env.*

func absi(x: Int64): Int64 {
    if (x < 0) {
        return -x
    }
    return x
}

main() {
    let reader = getStdIn()
    let n = Int64.parse(reader.readln().getOrThrow())
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let occ = Array<Int64>(n, { _ => 0 })
    let emp = Array<Int64>(n, { _ => 0 })
    var k: Int64 = 0
    var m: Int64 = 0
    for (i in 1..=n) {
        if (a[i - 1] == 1) {
            occ[k] = i
            k += 1
        } else {
            emp[m] = i
            m += 1
        }
    }
    let dp = Array<Int64>(m + 1, { _ => 0 })
    for (i in 1..=k) {
        var diag = dp[i - 1]
        for (j in i..=m) {
            let old = dp[j]
            let cand = diag + absi(occ[i - 1] - emp[j - 1])
            if (j == i) {
                dp[j] = cand
            } else if (dp[j - 1] < cand) {
                dp[j] = dp[j - 1]
            } else {
                dp[j] = cand
            }
            diag = old
        }
    }
    println(dp[m])
}
```

</details>
