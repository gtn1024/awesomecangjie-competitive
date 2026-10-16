---
oj: dmy
pid: '499'
title: 石头剪刀布
difficulty: 普及−
tags:
  - 线性DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^5$，$1 \le K \le N$，$1 \le R, P, S \le 10^4$，字符串 $T$ 只含 `r`、`p`、`s`。

## 思路

每一轮电脑的手势固定，要得分就必须出那个恰好能战胜它的手势：电脑出石头则出布得 $P$ 分，出布则出剪刀得 $S$ 分，出剪刀则出石头得 $R$ 分。于是每轮有一个「理想手势」和对应得分，不出理想手势则得 $0$ 分。

限制是第 $i$ 轮的手势不能等于第 $i-K$ 轮的手势，**只与相隔 $K$ 的位置有关**。因此按下标模 $K$ 分组，同组的位置构成一条链，链与链之间完全独立，链内相邻两项手势必须不同。

对每条链做 DP。设 $dp[i][c]$ 表示第 $i$ 轮出手势 $c$（$c \in \{\text{石头}, \text{布}, \text{剪刀}\}$）时，$i$ 所在链的前缀最大得分，则

$$dp[i][c] = \text{gain}(i, c) + \max_{c' \ne c} dp[i-K][c'],$$

其中 $\text{gain}(i, c)$ 在第 $i$ 轮的理想手势恰好是 $c$ 时取对应得分，否则为 $0$。$i \le K$ 时没有前驱，$dp[i][c] = \text{gain}(i, c)$。转移只有 $3 \times 3$ 种，直接枚举即可。

每条链的答案是链尾 $\max_c dp[i][c]$，所有链求和。链尾恰好是最后 $K$ 个位置，所以答案为

$$\sum_{i=N-K+1}^{N} \max_c\, dp[i][c].$$

## 复杂度

时间 $O(N)$（转移共 $9N$ 种），空间 $O(N)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let reader = getStdIn()
    let np = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = np[0]
    let k = np[1]
    let xs = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    // 评测数据的实际映射：x1=石头胜剪刀，x2=剪刀胜布，x3=布胜石头
    let rockBeatsScissors = xs[0]
    let scissorsBeatsPaper = xs[1]
    let paperBeatsRock = xs[2]
    let t = reader.readln().getOrThrow()

    let nn = n
    // dp[i][c]：第 i 轮出手势 c（0=r,1=p,2=s）时，i 所在同余链（下标模 K 同组）的最大得分
    let dp = Array<Array<Int64>>(nn, { _ => Array<Int64>(3, { _ => 0 }) })

    for (i in 0..nn) {
        let ch = t[i]
        var pg: Int64 = 0
        var v: Int64 = 0
        if (ch == 114) { // 'r'：出布胜，得 paperBeatsRock
            pg = 1
            v = paperBeatsRock
        } else if (ch == 112) { // 'p'：出剪刀胜，得 scissorsBeatsPaper
            pg = 2
            v = scissorsBeatsPaper
        } else { // 's'：出石头胜，得 rockBeatsScissors
            pg = 0
            v = rockBeatsScissors
        }
        for (c in 0..3) {
            let gain = if (Int64(c) == pg) {
                v
            } else {
                0
            }
            if (i < k) {
                dp[i][c] = gain
            } else {
                var best: Int64 = 0
                for (cp in 0..3) {
                    if (cp != c && dp[i - k][cp] > best) {
                        best = dp[i - k][cp]
                    }
                }
                dp[i][c] = gain + best
            }
        }
    }

    var ans: Int64 = 0
    for (i in (nn - k)..nn) {
        var rowBest: Int64 = 0
        for (c in 0..3) {
            if (dp[i][c] > rowBest) {
                rowBest = dp[i][c]
            }
        }
        ans += rowBest
    }
    println(ans)
}
```

</details>
