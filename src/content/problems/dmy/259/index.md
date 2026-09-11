---
oj: dmy
pid: '259'
title: '[R42D]超市'
difficulty: 提高
tags:
  - 二分
  - 贪心
timeLimit: 1s
memoryLimit: 512m
---

> 数据规模：$1 \le n, q \le 2 \times 10^5$，$1 = a_1 < a_2 < \dots < a_n \le 10^9$，$0 \le b_1 < b_2 < \dots < b_n \le 10^9$，$1 \le w_i \le 10^9$。

## 思路

支付金额 $c$ 确定后，下标 $d$ 被唯一确定为「最大的满足 $a_d \le c$ 的下标」，获得的价值为 $c + b_d$。也即支付金额 $c$ 落在某个桶 $[a_d, a_{d+1})$ 内时（约定 $a_{n+1} = +\infty$），$d$ 固定，价值随 $c$ 线性增长。

定义 $\mathit{val}_d = a_d + b_d$（桶 $d$ 能取到的最小价值），定义 $\mathit{gap}_d = a_{d+1} + b_d$（桶 $d$ 能取到的价值上界 $+1$，最后一段 $\mathit{gap}_{n-1} = +\infty$）。由于 $a$、$b$ 均严格递增，$\mathit{val}$ 与 $\mathit{gap}$ 都是严格递增序列，并且满足

$$
\mathit{val}_d < \mathit{gap}_d < \mathit{val}_{d+1}.
$$

所以各桶对应的价值区间 $[\mathit{val}_d, \mathit{gap}_d)$ 互不相交、依次排列。对一次询问 $w$，最优支付只有两种来源：

1. **卡在某个桶的最低点**：若 $\mathit{val}_d \ge w$，只需支付 $a_d$ 即可获得价值 $\mathit{val}_d \ge w$。由于 $a$ 递增，应取满足 $\mathit{val}_d \ge w$ 的最小 $d$，支付 $a_d$。对 $\mathit{val}$ 二分第一个 $\ge w$ 的位置即可。
2. **在某个桶内部恰好达到 $w$**：若 $\mathit{val}_d < w < \mathit{gap}_d$，则支付 $c = w - b_d$ 落在该桶内（$a_d \le w - b_d < a_{d+1}$），价值恰为 $w$。由上述区间互不相交，满足条件的 $d$ 至多一个，即 $\mathit{val}_d < w$ 的最大下标，再判断 $w < \mathit{gap}_d$ 是否成立即可。

对每次询问，两组候选取最小值即为答案，每个询问 $O(\log n)$。

## 复杂度

时间复杂度 $O((n + q) \log n)$，空间复杂度 $O(n)$。

## 仓颉实现

```cangjie
import std.convert.*
import std.env.*

main(): Int64 {
    let reader = getStdIn()
    let head = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = head[0]
    let q = head[1]
    let a = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let b = reader.readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })

    let INF: Int64 = 4000000005
    var qi: Int64 = 0
    while (qi < q) {
        let w = Int64.parse(reader.readln().getOrThrow())
        var ans: Int64 = -1

        // 候选 A：取最小的满足 val_d >= w 的 a_d
        var lo: Int64 = 0
        var hi: Int64 = n - 1
        var f: Int64 = -1
        while (lo <= hi) {
            let mid = (lo + hi) / 2
            if (a[mid] + b[mid] >= w) {
                f = mid
                hi = mid - 1
            } else {
                lo = mid + 1
            }
        }
        if (f != -1) {
            ans = a[f]
        }

        // 候选 B：val_d < w < gap_d 时支付 w - b_d
        lo = 0
        hi = n - 1
        var p: Int64 = -1
        while (lo <= hi) {
            let mid = (lo + hi) / 2
            if (a[mid] + b[mid] < w) {
                p = mid
                lo = mid + 1
            } else {
                hi = mid - 1
            }
        }
        if (p != -1) {
            var gapv: Int64 = INF
            if (p < n - 1) {
                gapv = a[p + 1] + b[p]
            }
            if (w < gapv) {
                let cand = w - b[p]
                if (ans == -1 || cand < ans) {
                    ans = cand
                }
            }
        }

        println(ans)
        qi += 1
    }
    return 0
}
```
