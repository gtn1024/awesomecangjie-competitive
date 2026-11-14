---
oj: dmy
pid: '552'
title: '小猫照片'
difficulty: 提高
tags:
  - 单调队列优化 DP
timeLimit: 1s
memoryLimit: 256m
---

> 数据规模：$1 \le n \le 5000$，$1 \le k, x \le n$，$1 \le a_i \le 10^9$。

## 思路

**先把条件化简成长度恰为 $k$ 的窗口。** 如果某段长度大于 $k$ 的区间里一张都没选，那么它内部任意一段长度恰为 $k$ 的区间里同样一张都没选；反过来，长度恰为 $k$ 的区间本身就是长度不小于 $k$ 的区间。所以「任意长度不小于 $k$ 的连续区间至少选一张」等价于「任意长度恰为 $k$ 的窗口至少选一张」。

**再把窗口条件翻译成对被选位置本身的约束。** 把选出的位置从小到大记为 $s_1 < s_2 < \dots < s_x$：

- 窗口 $[1,k]$ 必须含选中点，所以 $s_1 \le k$；
- 若相邻两点间隔 $s_{j+1}-s_j > k$，则窗口 $[s_j+1,\ s_j+k]$ 整段落在 $[1,n]$ 内且不含选中点，矛盾；而间隔不超过 $k$ 时，任何长度恰为 $k$ 的窗口都不会跨过这对相邻点却不碰到它们，所以 $s_{j+1}-s_j \le k$；
- 窗口 $[n-k+1,\ n]$ 必须含选中点，所以 $s_x \ge n-k+1$。

这三个条件都只涉及相邻的两个选中点，于是可以按「选了几张、最后一张在哪」做 DP。「恰好 $x$ 张」与它们并不冲突：只要间隔约束满足，在中间额外多选几个点不会破坏任何窗口，多选只会让窗口更容易被覆盖。

**状态与转移。** 设 $dp_{j,i}$ 表示已选 $j$ 张、最后一张在位置 $i$ 时的最大价值和。

$$dp_{1,i}=\begin{cases}a_i, & i \le k\\ -\infty, & i > k\end{cases}$$

$$dp_{j,i}=a_i+\max_{i-k \le p \le i-1} dp_{j-1,p}$$

初值把第一张限制在 $i \le k$，正对应 $s_1 \le k$；转移只允许前一张落在 $[i-k,\ i-1]$，正对应相邻间隔不超过 $k$。答案为 $\max_{i \ge n-k+1} dp_{x,i}$，即最后一张落在末尾那个窗口内；若下标 $\ge n-k+1$ 处全部不可达，说明不存在合法方案，输出 $-1$。

**用单调队列把转移降到均摊 $O(1)$。** 固定 $j$ 后，转移取的是一段随 $i$ 右移的滑动窗口，且只需要窗口最大值。用下标递增、值单调递减的双端队列维护 $dp_{j-1,\cdot}$：每步先尝试把 $i-1$ 从队尾插入（弹掉所有值不大于它的元素），再把下标小于 $i-k$ 的元素从队首弹出，队首恰好是 $\max_{p \in [i-k,\ i-1]} dp_{j-1,p}$。每层转移于是从 $O(nk)$ 降到 $O(n)$，总复杂度 $O(nx)$。

**边界与实现细节。** 第 $j$ 层只依赖第 $j-1$ 层，滚动保存两层即可，空间 $O(n)$。不可达状态用极小值标记，转移前先判断是否可达，避免把标记值当成真实和累加。几个退化情形：$k=1$ 时要求首张在位置 $1$ 且相邻间隔不超过 $1$，即必须选满全部位置，$x<n$ 无解；$k=n$ 时只有整段这一个窗口，$x=1$ 的答案就是所有 $a_i$ 的最大值，$x=n$ 只能全选；$x$ 很小时也可能无解（如 $n=5$、$k=2$、$x=1$：首张要落在前两张内、末张要落在后两张内，一张做不到）。

## 复杂度

时间 $O(nx)$，最多约 $2.5 \times 10^7$ 次转移；空间 $O(n)$，只需要两层 DP 数组和一个双端队列。

## 仓颉实现

位置统一用 $0$ 起下标，取答案时对应下标 $\ge n-k$ 的后缀。

<details>
<summary>查看仓颉实现</summary>

```cangjie
import std.env.*
import std.convert.*

main() {
    let first = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let n = first[0]
    let k = first[1]
    let x = first[2]
    let a = getStdIn().readln().getOrThrow().split(" ", removeEmpty: true).map({ p: String => Int64.parse(p) })
    let NEG: Int64 = -1152921504606846976
    var prev = Array<Int64>(n, { _ => NEG })
    for (i in 0..n) {
        if (i + 1 <= k) {
            prev[i] = a[i]
        }
    }
    let dq = Array<Int64>(n + 1, { _ => 0 })
    var j: Int64 = 2
    while (j <= x) {
        let cur = Array<Int64>(n, { _ => NEG })
        var h: Int64 = 0
        var t: Int64 = 0
        for (c in 0..n) {
            if (c >= 1) {
                let idx = c - 1
                while (t > h && prev[dq[t - 1]] <= prev[idx]) {
                    t -= 1
                }
                dq[t] = idx
                t += 1
            }
            while (t > h && dq[h] < c - k) {
                h += 1
            }
            if (t > h && prev[dq[h]] > NEG / 2) {
                cur[c] = prev[dq[h]] + a[c]
            }
        }
        prev = cur
        j += 1
    }
    var ans = NEG
    for (c in (n - k)..n) {
        if (prev[c] > ans) {
            ans = prev[c]
        }
    }
    if (ans < 0) {
        println(-1)
    } else {
        println(ans)
    }
}
```

</details>
