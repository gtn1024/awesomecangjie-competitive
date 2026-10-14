---
oj: dmy
pid: '499'
title: 石头剪刀布
difficulty: 普及−
tags:
  - 线性DP
  - 动态规划
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le N \le 10^5$，$1 \le K \le N$，$1 \le R,P,S \le 10^4$。

## 思路

记第二行给出的三个整数为 $A_1,A_2,A_3$。**本题数据中它们依次是石头、剪刀、布获胜的分数**：用石头战胜剪刀得 $A_1$ 分，用剪刀战胜布得 $A_2$ 分，用布战胜石头得 $A_3$ 分。注意这与题面里 $R,P,S$ 的排列相比，第二个数和第三个数互换了。

**每一轮的最优出手是唯一确定的。** 电脑出 `s` 时出石头（$A_1$ 分），出 `r` 时出布（$A_3$ 分），出 `p` 时出剪刀（$A_2$ 分）；出其余手势都是平局或失败，得 $0$ 分，所以第 $i$ 轮能拿到的最高分 $v_i$ 是唯一确定的。

**限制只把下标相差 $K$ 的轮次连在一起。** 按下标对 $K$ 取模分组，得到 $K$ 条链；链内相邻两轮（下标恰好差 $K$）手势不能相同，而不同链之间没有任何约束，因此对每条链单独求最优，再把各链的最优值相加。

**链内做线性 DP。** 设 $dp[g]$（$g=0,1,2$ 依次表示石头、布、剪刀）为处理到链上当前轮、且当前轮出手势 $g$ 时的最大累计得分，$val(i,g)$ 为第 $i$ 轮出手势 $g$ 的得分（只有克制手势非 $0$），则转移为

$$dp'[g] = val(i,g) + \max_{g' \ne g} dp[g'].$$

链的第一轮（下标 $< K$）不受任何限制，直接令 $dp[g] = val(i,g)$；一条链走完后取 $\max_g dp[g]$ 计入答案。手势只有 3 种，转移用 3 个变量滚动即可。

链内只有电脑手势相同的两轮才会冲突：此时两轮要出的克制手势也相同，只能放弃其中一轮的收益。电脑手势不同的两轮克制手势必不相同，可以同时获胜，所以冲突与链之间的选择互不牵连。

## 复杂度

时间 $O(N)$，额外空间 $O(1)$。

## 仓颉实现

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

func winHandOf(ch: UInt8): Int64 {
    if (ch == b'r') {
        return 1
    }
    if (ch == b'p') {
        return 2
    }
    return 0
}

main() {
    let reader = getStdIn()
    let first = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let k = first[1]
    let sc = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let gscore: Array<Int64> = [sc[0], sc[2], sc[1]]
    let t = reader.readln().getOrThrow()
    var total: Int64 = 0
    var c: Int64 = 0
    while (c < k && c < n) {
        var d0: Int64 = 0
        var d1: Int64 = 0
        var d2: Int64 = 0
        var i = c
        var started = false
        while (i < n) {
            let g = winHandOf(t[i])
            let w = gscore[g]
            var b0: Int64 = 0
            var b1: Int64 = 0
            var b2: Int64 = 0
            if (g == 0) {
                b0 = w
            } else if (g == 1) {
                b1 = w
            } else {
                b2 = w
            }
            if (started) {
                let e0 = max(d1, d2) + b0
                let e1 = max(d0, d2) + b1
                let e2 = max(d0, d1) + b2
                d0 = e0
                d1 = e1
                d2 = e2
            } else {
                d0 = b0
                d1 = b1
                d2 = b2
                started = true
            }
            i += k
        }
        total += max(d0, max(d1, d2))
        c += 1
    }
    println(total)
}
```

</details>
